/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Calls the Fal.ai Qwen Image Edit Plus API
 * @param {string} imageUrl - URL of the uploaded image from Fal.ai storage
 * @param {string} prompt - The prompt to generate the image with
 * @param {string} apiKey - Fal.ai API key for authentication
 * @param {string} context - Context string for logging/debugging
 * @returns {Promise<string>} URL of the generated image
 */
const callFalApi = async (
    imageUrl: string,
    prompt: string,
    apiKey: string,
    context: string
): Promise<string> => {
    console.log(`Calling Fal.ai for ${context} with prompt: ${prompt}`);
    
    const response = await fetch('https://fal.run/fal-ai/qwen-image-edit-plus', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image_urls: [imageUrl],
            prompt: prompt,
            output_format: 'png',
            enable_safety_checker: false,
            acceleration: 'regular',
            sync_mode: true,
            num_images: 1,
            image_size: 'square_hd'
        })
    });

    if (!response.ok) {
        let errorMessage = `Fal.ai API request failed with status ${response.status}`;
        try {
            const errorBody = await response.json();
            if (errorBody.error) {
                errorMessage += `: ${errorBody.error}`;
            } else if (errorBody.detail) {
                errorMessage += `: ${errorBody.detail}`;
            }
        } catch {
            try {
              const textError = await response.text();
              if (textError) errorMessage += `: ${textError}`;
            } catch {
                // Ignore if text parsing also fails
            }
        }
        console.error(`Fal.ai API error for ${context}:`, errorMessage.replace(apiKey, '[REDACTED]'));
        throw new Error(errorMessage.replace(apiKey, '[REDACTED]'));
    }

    const result: any = await response.json();

    if (result.images && result.images.length > 0 && result.images[0].url) {
        return result.images[0].url;
    } else {
        console.error(`Fal.ai API response did not contain an image for ${context}.`, { result });
        throw new Error(`The Fal.ai model did not return an image for the ${context}.`);
    }
};

const uploadImageToFal = async (imageFile: File, apiKey: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const uploadResponse = await fetch('https://fal.run/storage/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Key ${apiKey}`,
        },
        body: formData
    });

    if (!uploadResponse.ok) {
        let errorMessage = `Failed to upload image: ${uploadResponse.statusText}`;
        try {
            const errorBody = await uploadResponse.json();
            if (errorBody.detail) {
                 errorMessage += `: ${errorBody.detail}`;
            }
        } catch {
            // Can't parse JSON, do nothing extra
        }
        throw new Error(errorMessage.replace(apiKey, '[REDACTED]'));
    }

    const uploadResult = await uploadResponse.json();
    if (!uploadResult.url) {
        throw new Error('Image upload to Fal.ai did not return a URL.');
    }
    return uploadResult.url;
}

export const generateEditedImageWithFal = async (
    originalImage: File,
    userPrompt: string,
    apiKey: string
): Promise<string> => {
    const imageUrl = await uploadImageToFal(originalImage, apiKey);
    return callFalApi(imageUrl, userPrompt, apiKey, 'edit');
};

export const generateFilteredImageWithFal = async (
    originalImage: File,
    filterPrompt: string,
    apiKey: string,
): Promise<string> => {
    const imageUrl = await uploadImageToFal(originalImage, apiKey);
    const prompt = `Apply a stylistic filter to the entire image based on this request: "${filterPrompt}". Do not change the composition or content, only apply the style.`;
    return callFalApi(imageUrl, prompt, apiKey, 'filter');
};

export const generateAdjustedImageWithFal = async (
    originalImage: File,
    adjustmentPrompt: string,
    apiKey: string,
): Promise<string> => {
    const imageUrl = await uploadImageToFal(originalImage, apiKey);
    const prompt = `Perform a natural, global adjustment to the entire image based on this request: "${adjustmentPrompt}".`;
    return callFalApi(imageUrl, prompt, apiKey, 'adjustment');
};