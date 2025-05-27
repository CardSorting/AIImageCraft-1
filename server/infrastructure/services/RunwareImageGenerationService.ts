import { Runware } from "@runware/sdk-js";
import { IImageGenerationService, GenerateImageRequest, GeneratedImageResult } from '../../domain/services/IImageGenerationService';

export class RunwareImageGenerationService implements IImageGenerationService {
  private runware: any;

  constructor() {
    // Configure Runware client with enhanced logging
    const apiKey = process.env.RUNWARE_API_KEY;
    console.log(`[Runware] Initializing service with API key: ${apiKey ? 'CONFIGURED' : 'MISSING'}`);
    
    this.runware = new Runware({ 
      apiKey: apiKey || "",
      shouldReconnect: true,
      globalMaxRetries: 1,
      timeoutDuration: 90000  // Increased timeout to 90 seconds
    });
  }

  async generateImages(request: GenerateImageRequest): Promise<GeneratedImageResult[]> {
    console.log(`[Runware] Starting image generation request:`, {
      prompt: request.prompt.substring(0, 100) + '...',
      aspectRatio: request.aspectRatio,
      numImages: request.numImages,
      hasNegativePrompt: !!request.negativePrompt
    });

    const apiKey = process.env.RUNWARE_API_KEY;
    if (!apiKey) {
      const error = "Runware API key not configured. Please set RUNWARE_API_KEY environment variable.";
      console.error(`[Runware] ${error}`);
      throw new Error(error);
    }

    try {
      console.log(`[Runware] Ensuring connection before making request`);
      await this.runware.ensureConnection();
      
      // Convert aspect ratio format for Runware
      const [width, height] = this.parseAspectRatio(request.aspectRatio);
      
      // Convert model to Runware format if needed
      const runwareModel = this.convertToRunwareModel(request.model);
      console.log(`[Runware] Calling requestImages with dimensions: ${width}x${height}, model: ${runwareModel}`);
      
      const result = await this.runware.requestImages({
        positivePrompt: request.prompt,
        negativePrompt: request.negativePrompt || "",
        width: width,
        height: height,
        model: runwareModel,
        numberResults: request.numImages,
        outputType: "URL",
        outputFormat: "PNG",
        checkNSFW: true,
        onPartialImages: (images: any, error: any) => {
          if (error) {
            console.log(`[Runware] Partial generation error:`, error);
          } else {
            console.log(`[Runware] Received ${images.length} partial images`);
          }
        }
      });

      console.log(`[Runware] Raw result received:`, {
        imageCount: result?.length || 0,
        hasImages: Array.isArray(result) && result.length > 0
      });

      if (!result || !Array.isArray(result) || result.length === 0) {
        const error = "No images generated from Runware service";
        console.error(`[Runware] ${error}`, result);
        throw new Error(error);
      }

      const generatedImages = result.map((image, index) => {
        console.log(`[Runware] Processing image ${index + 1}:`, {
          hasUrl: !!image.imageURL,
          imageUUID: image.imageUUID,
          cost: image.cost
        });

        return {
          url: image.imageURL || "",
          fileName: `generated-${Date.now()}-${index}.png`,
          fileSize: undefined,
          seed: undefined,
        };
      });

      console.log(`[Runware] Successfully processed ${generatedImages.length} images`);
      return generatedImages;

    } catch (error: any) {
      console.error(`[Runware] Generation error details:`, {
        message: error.message,
        stack: error.stack
      });

      // Provide more specific error messages based on common issues
      if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        throw new Error(`Authentication failed: Please check your RUNWARE_API_KEY is valid and has sufficient credits.`);
      }
      
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error(`API quota exceeded: Please check your Runware account limits.`);
      }

      if (error.message?.includes('timeout')) {
        throw new Error(`Request timed out: The image generation took too long. Please try again.`);
      }

      throw new Error(`Image generation failed: ${error.message || 'Unknown error occurred'}`);
    }
  }

  private convertToRunwareModel(model?: string): string {
    // If no model provided, use default
    if (!model) {
      return "runware:100@1";
    }

    // If it's already a Runware model, use it as-is
    if (model.startsWith("runware:")) {
      return model;
    }

    // Civitai models are supported by Runware through AIR system
    if (model.startsWith("civitai:")) {
      console.log(`[Runware] Using Civitai model via AIR system: ${model}`);
      return model;
    }

    // For other models, try to use them directly or fallback to default
    console.log(`[Runware] Unknown model format: ${model}, using default`);
    return "runware:100@1";
  }

  private parseAspectRatio(aspectRatio: string): [number, number] {
    // All dimensions must be multiples of 64 for Runware API
    const aspectRatioMap: Record<string, [number, number]> = {
      "1:1": [512, 512],
      "16:9": [768, 448],  // 768/448 = 1.714 ≈ 16:9
      "9:16": [448, 768],  // 448/768 = 0.583 ≈ 9:16
      "3:4": [448, 576],   // 448/576 = 0.778 ≈ 3:4
      "4:3": [576, 448],   // 576/448 = 1.286 ≈ 4:3
    };

    return aspectRatioMap[aspectRatio] || [512, 512];
  }
}