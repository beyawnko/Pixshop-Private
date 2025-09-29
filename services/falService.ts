/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as fal from '@fal-ai/client';

const callFalApi = async (
    imageFile: File,
    prompt: string,
    apiKey: string,
    context: string
): Promise<string> => {
    console.log(`Calling Fal.ai for ${context} with prompt: ${prompt}`);

    try {
        // Upload image using the official Fal.ai client SDK
        const uploadedFile = await fal.upload(imageFile, {
            key: apiKey,
        });
        
        const imageUrl = uploadedFile.url;
        
        // Call the Qwen model using the official Fal.ai client SDK
        const result: any = await fal.run('fal-ai/qwen-image-edit-plus', {
            key: apiKey,
            input: {
                image_urls: [imageUrl],
                prompt: prompt,
                output_format: 'png',
                enable_safety_checker: false
            }
        });

        if (result.images && result.images.length > 0 && result.images[0].url) {
            return result.images[0].url;
        } else {
            console.error(`Fal.ai API response did not contain an image for ${context}.`, { result });
            throw new Error(`The Fal.ai model did not return an image for the ${context}.`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred with Fal.ai';
        // Sanitize API key from any error message
        console.error(`Fal.ai process failed for ${context}:`, message.replace(apiKey, '[REDACTED]'));
        throw new Error(message.replace(apiKey, '[REDACTED]'));
    }
};

export const generateEditedImageWithFal = async (
    originalImage: File,
    userPrompt: string,
    apiKey: string
): Promise<string> => {
    return callFalApi(originalImage, userPrompt, apiKey, 'edit');
};

export const generateFilteredImageWithFal = async (
    originalImage: File,
    filterPrompt: string,
    apiKey: string,
): Promise<string> => {
    const prompt = `Apply a stylistic filter to the entire image based on this request: "${filterPrompt}". Do not change the composition or content, only apply the style.`;
    return callFalApi(originalImage, prompt, apiKey, 'filter');
};

export const generateAdjustedImageWithFal = async (
    originalImage: File,
    adjustmentPrompt: string,
    apiKey: string,
): Promise<string> => {
    const prompt = `Perform a natural, global adjustment to the entire image based on this request: "${adjustmentPrompt}".`;
    return callFalApi(originalImage, prompt, apiKey, 'adjustment');
};
