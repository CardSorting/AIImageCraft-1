import { fal } from "@fal-ai/client";
import { IImageGenerationService, GenerateImageRequest, GeneratedImageResult } from '../../domain/services/IImageGenerationService';

export class FalAiImageGenerationService implements IImageGenerationService {
  constructor() {
    // Configure FAL AI client
    fal.config({
      credentials: process.env.FAL_KEY || process.env.FAL_AI_KEY || ""
    });
  }

  async generateImages(request: GenerateImageRequest): Promise<GeneratedImageResult[]> {
    if (!process.env.FAL_KEY && !process.env.FAL_AI_KEY) {
      throw new Error("FAL AI API key not configured. Please set FAL_KEY environment variable.");
    }

    try {
      const result = await fal.subscribe("fal-ai/imagen4/preview", {
        input: {
          prompt: request.prompt,
          negative_prompt: request.negativePrompt || "",
          aspect_ratio: request.aspectRatio,
          num_images: request.numImages,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join(", "));
          }
        },
      });

      if (!result.data || !result.data.images) {
        throw new Error("No images generated from FAL AI service");
      }

      return result.data.images.map(image => ({
        url: image.url,
        fileName: image.file_name || `generated-${Date.now()}.png`,
        fileSize: image.file_size || undefined,
        seed: result.data.seed || undefined,
      }));

    } catch (error: any) {
      console.error("FAL AI generation error:", error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
}