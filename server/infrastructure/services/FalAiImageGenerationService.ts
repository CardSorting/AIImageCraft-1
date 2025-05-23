import { fal } from "@fal-ai/client";
import { IImageGenerationService, GenerateImageRequest, GeneratedImageResult } from '../../domain/services/IImageGenerationService';

export class FalAiImageGenerationService implements IImageGenerationService {
  constructor() {
    // Configure FAL AI client with enhanced logging
    const apiKey = process.env.FAL_KEY || process.env.FAL_AI_KEY;
    console.log(`[FAL AI] Initializing service with API key: ${apiKey ? 'CONFIGURED' : 'MISSING'}`);
    
    fal.config({
      credentials: apiKey || ""
    });
  }

  async generateImages(request: GenerateImageRequest): Promise<GeneratedImageResult[]> {
    console.log(`[FAL AI] Starting image generation request:`, {
      prompt: request.prompt.substring(0, 100) + '...',
      aspectRatio: request.aspectRatio,
      numImages: request.numImages,
      hasNegativePrompt: !!request.negativePrompt
    });

    const apiKey = process.env.FAL_KEY || process.env.FAL_AI_KEY;
    if (!apiKey) {
      const error = "FAL AI API key not configured. Please set FAL_KEY environment variable.";
      console.error(`[FAL AI] ${error}`);
      throw new Error(error);
    }

    try {
      console.log(`[FAL AI] Calling fal.subscribe with endpoint: fal-ai/imagen4/preview`);
      
      const result = await fal.subscribe("fal-ai/imagen4/preview", {
        input: {
          prompt: request.prompt,
          negative_prompt: request.negativePrompt || "",
          aspect_ratio: request.aspectRatio,
          num_images: request.numImages,
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log(`[FAL AI] Queue update - Status: ${update.status}`);
          
          if (update.status === "IN_PROGRESS") {
            const logMessages = update.logs?.map((log: any) => log.message) || [];
            console.log(`[FAL AI] Progress logs:`, logMessages);
          }
          
          if (update.status === "COMPLETED") {
            console.log(`[FAL AI] Generation completed successfully`);
          }
          
          if (update.status === "FAILED") {
            console.error(`[FAL AI] Generation failed in queue`);
          }
        },
      });

      console.log(`[FAL AI] Raw result received:`, {
        hasData: !!result.data,
        hasImages: !!(result.data?.images),
        imageCount: result.data?.images?.length || 0,
        requestId: result.requestId,
        seed: result.data?.seed
      });

      if (!result.data) {
        const error = "No data received from FAL AI service";
        console.error(`[FAL AI] ${error}`, result);
        throw new Error(error);
      }

      if (!result.data.images || !Array.isArray(result.data.images) || result.data.images.length === 0) {
        const error = "No images generated from FAL AI service";
        console.error(`[FAL AI] ${error}`, result.data);
        throw new Error(error);
      }

      const generatedImages = result.data.images.map((image: any, index: number) => {
        console.log(`[FAL AI] Processing image ${index + 1}:`, {
          hasUrl: !!image.url,
          fileName: image.file_name,
          fileSize: image.file_size,
          contentType: image.content_type
        });

        return {
          url: image.url,
          fileName: image.file_name || `generated-${Date.now()}-${index}.png`,
          fileSize: image.file_size || undefined,
          seed: result.data.seed || undefined,
        };
      });

      console.log(`[FAL AI] Successfully processed ${generatedImages.length} images`);
      return generatedImages;

    } catch (error: any) {
      console.error(`[FAL AI] Generation error details:`, {
        message: error.message,
        status: error.status,
        body: error.body,
        stack: error.stack
      });

      // Provide more specific error messages based on common issues
      if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        throw new Error(`Authentication failed: Please check your FAL_KEY is valid and has sufficient credits.`);
      }
      
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error(`API quota exceeded: Please check your FAL AI account limits.`);
      }

      if (error.message?.includes('timeout')) {
        throw new Error(`Request timed out: The image generation took too long. Please try again.`);
      }

      throw new Error(`Image generation failed: ${error.message || 'Unknown error occurred'}`);
    }
  }
}