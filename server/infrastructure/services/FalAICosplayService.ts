import { fal } from "@fal-ai/client";

/**
 * FAL AI Cosplay Service
 * Specialized service for image transformations using FLUX.1 Kontext
 * Designed for AI Cosplay transformations with context understanding
 */
export class FalAICosplayService {
  constructor() {
    const apiKey = process.env.FAL_KEY;
    console.log(
      `[FalAI] Initializing Cosplay service with API key: ${apiKey ? "CONFIGURED" : "MISSING"}`,
    );

    if (!apiKey) {
      throw new Error(
        "FAL AI API key not configured. Please set FAL_KEY environment variable.",
      );
    }

    // Configure the FAL AI client
    fal.config({
      credentials: apiKey,
    });
  }

  async transformImage(params: {
    imageUrl: string;
    prompt: string;
    aspectRatio?: string;
    numImages?: number;
    guidanceScale?: number;
    seed?: number;
  }): Promise<
    {
      url: string;
      width: number;
      height: number;
    }[]
  > {
    console.log(`[FalAI] Starting cosplay transformation:`, {
      prompt: params.prompt.substring(0, 100) + "...",
      aspectRatio: params.aspectRatio,
      numImages: params.numImages,
      guidanceScale: params.guidanceScale,
    });

    try {
      // Ensure we're using a proper image URL and not base64
      let imageUrl = params.imageUrl;
      if (params.imageUrl.startsWith('data:')) {
        console.log(`[FalAI] Converting base64 to hosted URL...`);
        // Convert base64 to blob and upload to FAL storage
        const response = await fetch(params.imageUrl);
        const blob = await response.blob();
        imageUrl = await fal.storage.upload(blob);
        console.log(`[FalAI] Uploaded image to: ${imageUrl}`);
      }

      const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
        input: {
          prompt: params.prompt,
          image_url: imageUrl,
          guidance_scale: params.guidanceScale || 3.5,
          num_images: params.numImages || 1,
          aspect_ratio: params.aspectRatio || "1:1",
          output_format: "jpeg", // Changed to jpeg for better compatibility
          safety_tolerance: "5",
          sync_mode: false, // Changed to false to ensure proper URL handling
          ...(params.seed && { seed: params.seed }),
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs
              ?.map((log) => log.message)
              .forEach((message) => {
                console.log(`[FalAI] ${message}`);
              });
          }
        },
      });

      console.log(`[FalAI] Transformation completed successfully`);
      console.log(
        `[FalAI] Generated ${result.data.images?.length || 0} images`,
      );

      // Debug: Log the actual response structure
      console.log(`[FalAI] Response structure:`, JSON.stringify(result.data, null, 2));

      if (!result.data.images || result.data.images.length === 0) {
        throw new Error("No images generated from FAL AI service");
      }

      // Process images and ensure we have proper URLs
      const processedImages = await Promise.all(
        result.data.images.map(async (image: any) => {
          let imageUrl = image.url;
          
          // Debug: Log each image object
          console.log(`[FalAI] Processing image:`, JSON.stringify(image, null, 2));
          
          // Check if we got a base64 data URI instead of a URL
          if (imageUrl && imageUrl.startsWith('data:')) {
            console.warn(`[FalAI] Received base64 data URI instead of hosted URL, converting...`);
            // Convert base64 to hosted URL using FAL storage
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              imageUrl = await fal.storage.upload(blob);
              console.log(`[FalAI] Successfully converted base64 to hosted URL: ${imageUrl.substring(0, 50)}...`);
            } catch (uploadError) {
              console.error(`[FalAI] Failed to upload base64 image to FAL storage:`, uploadError);
              // Keep the base64 as fallback - this should not happen in production
              throw new Error("Failed to convert image to hosted URL");
            }
          } else if (!imageUrl) {
            console.error(`[FalAI] No URL found in image response`);
            throw new Error("Image URL missing from FAL AI response");
          } else {
            console.log(`[FalAI] Got proper hosted URL: ${imageUrl.substring(0, 50)}...`);
          }

          return {
            url: imageUrl,
            width: image.width || 1024,
            height: image.height || 1024,
          };
        })
      );

      return processedImages;
    } catch (error: any) {
      console.error(`[FalAI] Transformation error:`, {
        message: error.message,
        name: error.name,
        status: error.status,
        statusCode: error.statusCode,
        response: error.response?.data,
        stack: error.stack?.substring(0, 300),
      });

      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("401")
      ) {
        throw new Error(
          `Authentication failed: Please check your FAL_KEY is valid and has sufficient credits.`,
        );
      }

      if (
        error.message?.includes("quota") ||
        error.message?.includes("limit")
      ) {
        throw new Error(
          `API quota exceeded: Please check your FAL AI account limits.`,
        );
      }

      if (error.message?.includes("timeout")) {
        throw new Error(
          `Request timed out: The image transformation took too long. Please try again.`,
        );
      }

      if (
        error.message?.includes("nsfw") ||
        error.message?.includes("safety")
      ) {
        throw new Error(
          `Content safety check failed: The transformation request was rejected for safety reasons.`,
        );
      }

      throw new Error(
        `Image transformation failed: ${error.message || "Unknown error occurred"} - Please verify your FAL AI account status.`,
      );
    }
  }
}
