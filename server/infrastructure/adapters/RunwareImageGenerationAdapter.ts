import { Runware } from "@runware/sdk-js";
import { IImageGenerationService, GenerateImageRequest, GeneratedImageResult } from '../../domain/services/IImageGenerationService';

/**
 * Runware Image Generation Adapter
 * Implements Adapter pattern to integrate with Runware SDK
 * Follows Apple's philosophy of seamless integration
 */
export class RunwareImageGenerationAdapter implements IImageGenerationService {
  private runware: any;

  constructor() {
    const apiKey = process.env.RUNWARE_API_KEY;
    console.log(`[Runware] Initializing adapter with API key: ${apiKey ? 'CONFIGURED' : 'MISSING'}`);
    
    this.runware = new Runware({ 
      apiKey: apiKey || "",
      shouldReconnect: true,
      globalMaxRetries: 2,
      timeoutDuration: 60000
    });
  }

  async generateImages(request: GenerateImageRequest): Promise<GeneratedImageResult[]> {
    console.log(`[Runware] Starting image generation:`, {
      prompt: request.prompt.substring(0, 100) + '...',
      aspectRatio: request.aspectRatio,
      numImages: request.numImages
    });

    const apiKey = process.env.RUNWARE_API_KEY;
    if (!apiKey) {
      throw new Error("Runware API key not configured. Please set RUNWARE_API_KEY environment variable.");
    }

    try {
      await this.runware.ensureConnection();
      
      const [width, height] = this.parseAspectRatio(request.aspectRatio);
      
      const result = await this.runware.requestImages({
        positivePrompt: request.prompt,
        negativePrompt: request.negativePrompt || "",
        width: width,
        height: height,
        model: "runware:100@1",
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

      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error("No images generated from Runware service");
      }

      return result.map((image, index) => ({
        url: image.imageURL || "",
        fileName: `generated-${Date.now()}-${index}.png`,
        fileSize: undefined,
        seed: undefined,
      }));

    } catch (error: any) {
      console.error(`[Runware] Generation error:`, error.message);
      
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

  private parseAspectRatio(aspectRatio: string): [number, number] {
    const aspectRatioMap: Record<string, [number, number]> = {
      "1:1": [512, 512],
      "16:9": [768, 432],
      "9:16": [432, 768],
      "3:4": [432, 576],
      "4:3": [576, 432],
    };

    return aspectRatioMap[aspectRatio] || [512, 512];
  }
}