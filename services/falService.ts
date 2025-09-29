/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

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
    
    const isBase64 = imageData.startsWith('data:');

    const requestBody = {
        ...(isBase64 ? { image_url: imageData } : { image_urls: [imageData] }),
        prompt: prompt,
        output_format: 'png',
        enable_safety_checker: false,
        acceleration: 'regular',
        sync_mode: true,
        num_images: 1,
        image_size: 'square_hd'
    };
    
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

const imageFileToBase64 = async (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String);
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(imageFile);
    });
}

export const generateEditedImageWithFal = async (
    originalImage: File,
    userPrompt: string,
    apiKey: string
): Promise<string> => {
    const imageBase64 = await imageFileToBase64(originalImage);
    return callFalApi(imageBase64, userPrompt, apiKey, 'edit');
};

export const generateFilteredImageWithFal = async (
    originalImage: File,
    filterPrompt: string,
    apiKey: string,
): Promise<string> => {
    const imageBase64 = await imageFileToBase64(originalImage);
    const prompt = `Apply a stylistic filter to the entire image based on this request: "${filterPrompt}". Do not change the composition or content, only apply the style.`;
    return callFalApi(imageBase64, prompt, apiKey, 'filter');
};

export const generateAdjustedImageWithFal = async (
    originalImage: File,
    adjustmentPrompt: string,
    apiKey: string,
): Promise<string> => {
    const imageBase64 = await imageFileToBase64(originalImage);
    const prompt = `Perform a natural, global adjustment to the entire image based on this request: "${adjustmentPrompt}".`;
    return callFalApi(imageBase64, prompt, apiKey, 'adjustment');
};
