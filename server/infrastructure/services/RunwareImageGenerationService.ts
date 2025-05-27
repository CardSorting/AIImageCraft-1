import { runware } from '@runware/ai-sdk-provider';
import { experimental_generateImage as generateImage } from 'ai';
import { IImageGenerationService, GenerateImageRequest, GeneratedImageResult } from '../../domain/services/IImageGenerationService';

export class RunwareImageGenerationService implements IImageGenerationService {
  constructor() {
    const apiKey = process.env.RUNWARE_API_KEY;
    console.log(`[Runware] Initializing AI SDK provider with API key: ${apiKey ? 'CONFIGURED' : 'MISSING'}`);
    
    if (!apiKey) {
      throw new Error("Runware API key not configured. Please set RUNWARE_API_KEY environment variable.");
    }
  }

  async generateImages(request: GenerateImageRequest): Promise<GeneratedImageResult[]> {
    console.log(`[Runware] Starting AI SDK image generation:`, {
      prompt: request.prompt.substring(0, 100) + '...',
      aspectRatio: request.aspectRatio,
      numImages: request.numImages,
      hasNegativePrompt: !!request.negativePrompt,
      model: request.model
    });

    try {
      // Convert aspect ratio to size format for Vercel AI SDK
      const size = this.convertAspectRatioToSize(request.aspectRatio);
      
      // Convert model to proper AIR ID format
      const modelId = this.convertToRunwareModel(request.model);
      console.log(`[Runware] Using model: ${modelId}, size: ${size}`);

      // Create model instance
      const model = runware.image(modelId);

      // Generate single image first (we can extend to multiple later)
      const result = await generateImage({
        model: model,
        prompt: request.prompt,
        size: size as any,
        n: request.numImages,
        providerOptions: {
          runware: {
            negativePrompt: request.negativePrompt || "",
            outputFormat: "PNG",
            checkNSFW: true,
            steps: 20
          }
        }
      });

      console.log(`[Runware] AI SDK result:`, {
        hasImage: !!result.image,
        hasImages: !!result.images,
        imageCount: result.images?.length || (result.image ? 1 : 0)
      });

      // Handle both single and multiple image responses
      const images = result.images || (result.image ? [result.image] : []);
      
      if (images.length === 0) {
        throw new Error("No images generated from Runware AI SDK");
      }

      const generatedImages = images.map((image: any, index) => {
        console.log(`[Runware] Processing image ${index + 1}:`, {
          hasUrl: !!(image.url || image.base64),
          url: (image.url || 'base64 data')?.substring(0, 50) + '...'
        });

        return {
          url: image.url || `data:image/png;base64,${image.base64}` || "",
          fileName: `generated-${Date.now()}-${index}.png`,
          fileSize: undefined,
          seed: undefined,
        };
      });

      console.log(`[Runware] Successfully generated ${generatedImages.length} images`);
      return generatedImages;

    } catch (error: any) {
      console.error(`[Runware] AI SDK generation error:`, {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200)
      });

      // Handle specific AI SDK errors
      if (error.name === 'RunwareAPIError') {
        throw new Error(`Runware API Error: ${error.message}`);
      }
      
      if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        throw new Error(`Authentication failed: Please check your RUNWARE_API_KEY is valid.`);
      }
      
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error(`API quota exceeded: Please check your Runware account limits.`);
      }

      throw new Error(`Image generation failed: ${error.message || 'Unknown error occurred'}`);
    }
  }

  private convertAspectRatioToSize(aspectRatio: string): string {
    // Convert aspect ratio to size format for Vercel AI SDK
    const sizeMap: Record<string, string> = {
      "1:1": "1024x1024",
      "16:9": "1344x768",
      "9:16": "768x1344", 
      "3:4": "896x1152",
      "4:3": "1152x896",
    };
    return sizeMap[aspectRatio] || "1024x1024";
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
}