/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Converts a File object to a base64 data URL.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves with the data URL.
 */
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


/**
 * Calls the Fal.ai Qwen Image Edit Plus API
 * @param {string} imageData - URL or base64 data URI of the image
 * @param {string} prompt - The prompt to generate the image with
 * @param {string} apiKey - Fal.ai API key for authentication
 * @param {string} context - Context string for logging/debugging
 * @returns {Promise<string>} URL of the generated image
 */
const callFalApi = async (
    imageData: string,
    prompt: string,
    apiKey: string,
    context: string
): Promise<string> => {
    console.log(`Calling Fal.ai for ${context} with prompt: ${prompt}`);
    console.log(`Using image data: ${imageData.substring(0, 80)}...`);
    
    const requestBody = {
        prompt: prompt,
        image_urls: [imageData], // Always use array format for URLs
        image_size: 'square_hd',
        num_inference_steps: 50,
        guidance_scale: 4,
        num_images: 1,
        enable_safety_checker: false,
        output_format: 'png',
        seed: null,
        sync_mode: true
    };
    
    console.log('FAL API Request:', JSON.stringify({
        url: 'https://fal.run/fal-ai/qwen-image-edit-plus',
        method: 'POST',
        body: { ...requestBody, image_urls: [`${imageData.substring(0, 80)}... (truncated)`] }
    }, null, 2));

    const response = await fetch('https://fal.run/fal-ai/qwen-image-edit-plus', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        let errorMessage = `Fal.ai API request failed with status ${response.status}`;
        let detailedError = null;
        
        try {
            const errorBody = await response.json();
            detailedError = errorBody;
            console.error('FAL API Error Response:', JSON.stringify(errorBody, null, 2));
            
            if (errorBody.error) {
                errorMessage += `: ${errorBody.error}`;
            } else if (errorBody.detail) {
                // Handle both string and array detail formats
                if (Array.isArray(errorBody.detail)) {
                    const detailStrings = errorBody.detail.map((d: any) => {
                        if (typeof d === 'object') {
                            return `${d.type || 'error'}: ${d.msg || JSON.stringify(d)}`;
                        }
                        return String(d);
                    });
                    errorMessage += `: ${detailStrings.join(', ')}`;
                } else if (typeof errorBody.detail === 'object') {
                    errorMessage += `: ${JSON.stringify(errorBody.detail)}`;
                } else {
                    errorMessage += `: ${errorBody.detail}`;
                }
            } else {
                errorMessage += `: ${JSON.stringify(errorBody)}`;
            }
        } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            try {
              const textError = await response.text();
              if (textError) {
                  errorMessage += `: ${textError}`;
                  console.error('Raw error response:', textError);
              }
            } catch (textError) {
                console.error('Failed to get text error:', textError);
                errorMessage += `: Unknown error (failed to parse response)`;
            }
        }
        
        const redactedMessage = errorMessage.replace(apiKey, '[REDACTED]');
        console.error(`Fal.ai API error for ${context}:`, redactedMessage);
        
        if (detailedError) {
            console.error('Detailed error object:', JSON.stringify(detailedError, null, 2));
        }
        
        throw new Error(redactedMessage);
    }

    const result: any = await response.json();

    if (result.images && result.images.length > 0 && result.images[0].url) {
        return result.images[0].url;
    } else {
        console.error(`Fal.ai API response did not contain an image for ${context}.`, { result });
        throw new Error(`The Fal.ai model did not return an image for the ${context}.`);
    }
};

export const generateEditedImageWithFal = async (
    originalImage: File,
    userPrompt: string,
    apiKey: string
): Promise<string> => {
    // Validate inputs
    if (!originalImage) {
        throw new Error('Original image is required');
    }
    if (!userPrompt || !userPrompt.trim()) {
        throw new Error('Prompt is required and cannot be empty');
    }
    if (!apiKey || !apiKey.trim()) {
        throw new Error('API key is required');
    }
    if (userPrompt.length > 800) {
        throw new Error('Prompt must be 800 characters or less');
    }
    
    // Check file size (FAL has limits, data URI adds ~33% overhead)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (originalImage.size > maxSize * 0.75) {
        throw new Error('Image file is too large (max ~7.5MB for this method)');
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(originalImage.type)) {
        throw new Error(`Invalid image type: ${originalImage.type}. Supported: ${validTypes.join(', ')}`);
    }
    
    try {
        const imageDataUrl = await fileToDataUrl(originalImage);
        return callFalApi(imageDataUrl, userPrompt, apiKey, 'edit');
    } catch (error) {
        console.error('FAL Edit Error:', error);
        throw error;
    }
};

export const generateFilteredImageWithFal = async (
    originalImage: File,
    filterPrompt: string,
    apiKey: string,
): Promise<string> => {
    // Validate inputs
    if (!originalImage || !filterPrompt?.trim() || !apiKey?.trim()) {
        throw new Error('All parameters are required');
    }
    
    const imageDataUrl = await fileToDataUrl(originalImage);
    const prompt = `Apply a stylistic filter to the entire image based on this request: "${filterPrompt}". Do not change the composition or content, only apply the style.`;
    return callFalApi(imageDataUrl, prompt, apiKey, 'filter');
};

export const generateAdjustedImageWithFal = async (
    originalImage: File,
    adjustmentPrompt: string,
    apiKey: string,
): Promise<string> => {
    // Validate inputs
    if (!originalImage || !adjustmentPrompt?.trim() || !apiKey?.trim()) {
        throw new Error('All parameters are required');
    }
    
    const imageDataUrl = await fileToDataUrl(originalImage);
    const prompt = `Perform a natural, global adjustment to the entire image based on this request: "${adjustmentPrompt}".`;
    return callFalApi(imageDataUrl, prompt, apiKey, 'adjustment');
};
