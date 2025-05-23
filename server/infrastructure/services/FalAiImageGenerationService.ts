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
      console.log(`🎨 Starting FAL AI generation for prompt: "${request.prompt}"`);
      
      // Add timeout wrapper with longer timeout for queue delays
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI service is experiencing high demand. Please try again in a moment!')), 120000); // 2 minutes
      });

      const generationPromise = fal.subscribe("fal-ai/imagen4/preview", {
        input: {
          prompt: request.prompt,
          negative_prompt: request.negativePrompt || "",
          aspect_ratio: request.aspectRatio,
          num_images: request.numImages,
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log(`📊 FAL AI Status: ${update.status}`);
          if (update.status === "IN_PROGRESS") {
            console.log("🔄 Generation progress:", update.logs?.map((log: any) => log.message).join(", "));
          }
        },
      });

      const result = await Promise.race([generationPromise, timeoutPromise]) as any;

      if (!result.data || !result.data.images) {
        throw new Error("No images generated from FAL AI service");
      }

      console.log(`✅ FAL AI generation completed: ${result.data.images.length} images`);

      return result.data.images.map((image: any) => ({
        url: image.url,
        fileName: image.file_name || `generated-${Date.now()}.png`,
        fileSize: image.file_size || undefined,
        seed: result.data.seed ? String(result.data.seed) : undefined,
      }));

    } catch (error: any) {
      console.error("❌ FAL AI generation error:", error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
}