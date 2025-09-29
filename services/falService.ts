/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Helper to convert File to data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

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
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Fal.ai API error for ${context}:`, errorBody);
        throw new Error(`Fal.ai API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();

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
    const imageUrl = await fileToDataUrl(originalImage);
    return callFalApi(imageUrl, userPrompt, apiKey, 'edit');
};

export const generateFilteredImageWithFal = async (
    originalImage: File,
    filterPrompt: string,
    apiKey: string,
): Promise<string> => {
    const imageUrl = await fileToDataUrl(originalImage);
    const prompt = `Apply a stylistic filter to the entire image based on this request: "${filterPrompt}". Do not change the composition or content, only apply the style.`;
    return callFalApi(imageUrl, prompt, apiKey, 'filter');
};

export const generateAdjustedImageWithFal = async (
    originalImage: File,
    adjustmentPrompt: string,
    apiKey: string,
): Promise<string> => {
    const imageUrl = await fileToDataUrl(originalImage);
    const prompt = `Perform a natural, global adjustment to the entire image based on this request: "${adjustmentPrompt}".`;
    return callFalApi(imageUrl, prompt, apiKey, 'adjustment');
};
