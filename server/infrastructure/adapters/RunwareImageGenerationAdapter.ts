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
      
      // Build request in exact Runware API format
      const runwareRequest = {
        taskType: "imageInference",
        taskUUID: this.generateTaskUUID(),
        positivePrompt: request.prompt,
        negativePrompt: request.negativePrompt || "",
        model: request.model || "runware:100@1",
        height: height,
        width: width,
        numberResults: request.numImages,
        outputType: "URL",
        outputFormat: "PNG",
        checkNSFW: true,
        ...(request.loras && request.loras.length > 0 && {
          lora: request.loras.map(lora => ({
            model: lora.model,
            weight: lora.weight
          }))
        }),
        ...(request.steps && { steps: request.steps }),
        ...(request.cfgScale && { CFGScale: request.cfgScale }),
        ...(request.seed && { seed: request.seed }),
        ...(request.scheduler && { scheduler: request.scheduler })
      };

      console.log(`[Runware] Request format:`, JSON.stringify(runwareRequest, null, 2));
      
      const result = await this.runware.requestImages(runwareRequest);

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
      console.error(`[Runware] Generation error:`, {
        message: error.message,
        name: error.name,
        code: error.code,
        status: error.status,
        statusCode: error.statusCode,
        response: error.response?.data,
        stack: error.stack?.substring(0, 300)
      });
      
      if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        throw new Error(`Authentication failed: Please check your RUNWARE_API_KEY is valid and has sufficient credits.`);
      }
      
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error(`API quota exceeded: Please check your Runware account limits.`);
      }

      if (error.message?.includes('timeout')) {
        throw new Error(`Request timed out: The image generation took too long. Please try again.`);
      }

      throw new Error(`Image generation failed: ${error.message || 'Unknown error occurred'} - Please verify your Runware API key and account status.`);
    }
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

  private generateTaskUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}