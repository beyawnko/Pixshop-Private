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
 * Compresses an image file if it exceeds a certain size threshold.
 * Converts image to JPEG to reduce size. Does not resize the image.
 * @param file The image file to process.
 * @param maxSizeBytes The maximum allowed file size in bytes. Defaults to 7.5MB.
 * @returns A promise that resolves to the compressed file, or the original if it's small enough.
 */
const compressImageIfNeeded = async (file: File, maxSizeBytes: number = 7.5 * 1024 * 1024): Promise<File> => {
    if (file.size <= maxSizeBytes && file.type !== 'image/gif') { // Also process GIFs to convert them to static JPEG
        return file;
    }

    return new Promise((resolve, reject) => {
        const action = file.size > maxSizeBytes ? 'Compressing' : 'Converting';
        console.log(`${action} image from ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));

                // Use original dimensions, no resizing
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                // Convert to blob for compression
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            if (blob.size > maxSizeBytes) {
                                console.warn(`Image still too large after compression: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                            }
                            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
                            const newFile = new File([blob], newFileName, { type: 'image/jpeg' });
                            resolve(newFile);
                        } else {
                            reject(new Error('Canvas toBlob returned null.'));
                        }
                    },
                    'image/jpeg',
                    0.9 // 90% quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

type FalApiImageSize = string | { width: number; height: number };

/**
 * Translates an image size key into the format expected by the Fal.ai API.
 * @param {string} sizeKey - The internal key for the image size (e.g., 'square_2k').
 * @returns {FalApiImageSize} A string for presets or an object for custom dimensions.
 */
const getImageSizeValue = (sizeKey: string): FalApiImageSize => {
    switch (sizeKey) {
        case 'square_2k':
            return { width: 2048, height: 2048 };
        case 'landscape_uhd':
            return { width: 3840, height: 2160 };
        // For keys that match the API's presets, return the key itself.
        case 'square_hd':
        case 'square':
        case 'portrait_4_3':
        case 'portrait_16_9':
        case 'landscape_4_3':
        case 'landscape_16_9':
            return sizeKey;
        default:
            console.warn(`Unknown image size key: ${sizeKey}, defaulting to 'square_hd'.`);
            return 'square_hd';
    }
};

/**
 * Calls the Fal.ai Qwen Image Edit Plus API
 * @param {string[]} imageDataUrls - Array of URLs or base64 data URIs of the images
 * @param {string} prompt - The prompt to generate the image with
 * @param {string} apiKey - Fal.ai API key for authentication
 * @param {string} context - Context string for logging/debugging
 * @param {string} imageSizeKey - The key for the desired output image size/aspect ratio.
 * @returns {Promise<string>} URL of the generated image
 */
const callFalApi = async (
    imageDataUrls: string[],
    prompt: string,
    apiKey: string,
    context: string,
    imageSizeKey: string
): Promise<string> => {
    const imageSizeValue = getImageSizeValue(imageSizeKey);
    console.log(`Calling Fal.ai for ${context} with prompt: ${prompt}`);
    console.log(`Using ${imageDataUrls.length} image(s). Output size key: ${imageSizeKey}, API value:`, imageSizeValue);
    
    const requestBody: { [key: string]: any } = {
        prompt: prompt,
        image_urls: imageDataUrls,
        image_size: imageSizeValue,
        num_inference_steps: 50,
        guidance_scale: 4,
        num_images: 1,
        enable_safety_checker: false,
        output_format: 'png',
        seed: null,
        sync_mode: true,
    };
    
    console.log('FAL API Request:', JSON.stringify({
        url: 'https://fal.run/fal-ai/qwen-image-edit-plus',
        method: 'POST',
        body: { ...requestBody, image_urls: requestBody.image_urls.map((url: string) => `${url.substring(0, 80)}... (truncated)`) }
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
    primaryImage: File,
    referenceImage: File | null,
    userPrompt: string,
    apiKey: string,
    imageSize: string
): Promise<string> => {
    // Validate inputs
    if (!primaryImage) {
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
    
    const imagesToProcess: File[] = [primaryImage];
    if (referenceImage) {
        imagesToProcess.push(referenceImage);
    }
    
    const compressedImages = await Promise.all(
        imagesToProcess.map(image => compressImageIfNeeded(image))
    );

    for (const image of compressedImages) {
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(image.type)) {
            throw new Error(`Invalid image type for '${image.name}': ${image.type}. Supported: ${validTypes.join(', ')}`);
        }
    }

    // Build a more descriptive prompt for the AI to ensure it uses the reference images.
    let promptWithInstructions = `Perform an edit on the primary image based on the following request: "${userPrompt}".`;
    if (referenceImage) {
        promptWithInstructions += " Use the additional provided image as a reference for style, content, or context for the edit.";
    }
    
    try {
        const imageDataUrls = await Promise.all(compressedImages.map(fileToDataUrl));
        return callFalApi(imageDataUrls, promptWithInstructions, apiKey, 'edit', imageSize);
    } catch (error) {
        console.error('FAL Edit Error:', error);
        throw error;
    }
};

export const generateFilteredImageWithFal = async (
    originalImage: File,
    filterPrompt: string,
    apiKey: string,
    imageSize: string
): Promise<string> => {
    // Validate inputs
    if (!originalImage || !filterPrompt?.trim() || !apiKey?.trim()) {
        throw new Error('All parameters are required');
    }
    
    const compressedImage = await compressImageIfNeeded(originalImage);
    const imageDataUrl = await fileToDataUrl(compressedImage);
    const prompt = `Apply a stylistic filter to the entire image based on this request: "${filterPrompt}". Do not change the composition or content, only apply the style.`;
    return callFalApi([imageDataUrl], prompt, apiKey, 'filter', imageSize);
};

export const generateAdjustedImageWithFal = async (
    originalImage: File,
    adjustmentPrompt: string,
    apiKey: string,
    imageSize: string
): Promise<string> => {
    // Validate inputs
    if (!originalImage || !adjustmentPrompt?.trim() || !apiKey?.trim()) {
        throw new Error('All parameters are required');
    }
    
    const compressedImage = await compressImageIfNeeded(originalImage);
    const imageDataUrl = await fileToDataUrl(compressedImage);
    const prompt = `Perform a natural, global adjustment to the entire image based on this request: "${adjustmentPrompt}".`;
    return callFalApi([imageDataUrl], prompt, apiKey, 'adjustment', imageSize);
};