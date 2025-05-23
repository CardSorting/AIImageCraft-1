import { GenerateImagesCommand } from '../commands/GenerateImagesCommand';
import { StoreImageToCloudCommand } from '../commands/StoreImageToCloudCommand';
import { StoreImageToCloudCommandHandler } from './StoreImageToCloudCommandHandler';
import { ImageGeneration } from '../../domain/entities/ImageGeneration';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';
import { IImageGenerationService } from '../../domain/services/IImageGenerationService';
import { ICloudStorageService } from '../../domain/services/ICloudStorageService';

export class GenerateImagesCommandHandler {
  private cloudStorageHandler: StoreImageToCloudCommandHandler;

  constructor(
    private readonly imageGenerationService: IImageGenerationService,
    private readonly imageRepository: IImageGenerationRepository,
    private readonly cloudStorageService: ICloudStorageService
  ) {
    this.cloudStorageHandler = new StoreImageToCloudCommandHandler(cloudStorageService, imageRepository);
  }

  async handle(command: GenerateImagesCommand): Promise<ImageGeneration[]> {
    console.log(`🎨 Generating ${command.numImages} image(s) with AI...`);
    
    // Generate images using external service
    const generatedResults = await this.imageGenerationService.generateImages({
      prompt: command.prompt,
      negativePrompt: command.negativePrompt,
      aspectRatio: command.aspectRatio,
      numImages: command.numImages
    });

    console.log(`✨ Generated ${generatedResults.length} images, now storing to B2...`);

    // Create domain entities and save to repository with B2 storage
    const savedImages: ImageGeneration[] = [];
    
    for (const result of generatedResults) {
      try {
        // For now, use FAL URL directly to prevent timeout
        // TODO: Implement background B2 storage later
        const imageGeneration = ImageGeneration.create({
          prompt: command.prompt,
          negativePrompt: command.negativePrompt,
          aspectRatio: command.aspectRatio,
          imageUrl: result.url, // Use FAL URL for immediate response
          fileName: result.fileName,
          fileSize: result.fileSize,
          seed: result.seed
        });

        const savedImage = await this.imageRepository.save(imageGeneration);
        savedImages.push(savedImage);
        
        console.log(`💾 Saved image: ${savedImage.fileName}`);
        
        // Store to cloud in background (non-blocking)
        this.storeImageToCloudInBackground(result.url, savedImage.id, result.fileName);
        
      } catch (error: any) {
        console.error(`❌ Failed to save image: ${error.message}`);
        // Continue with other images even if one fails
      }
    }

    console.log(`🎉 Successfully processed ${savedImages.length}/${generatedResults.length} images`);
    return savedImages;
  }

  /**
   * Store image to cloud storage in background without blocking the response
   */
  private async storeImageToCloudInBackground(falUrl: string, imageId: number, fileName?: string): Promise<void> {
    try {
      const cloudCommand = new StoreImageToCloudCommand(falUrl, imageId, fileName);
      await this.cloudStorageHandler.handle(cloudCommand);
    } catch (error: any) {
      console.error(`⚠️ Background cloud storage failed for image ${imageId}:`, error.message);
      // Don't throw - this is background processing
    }
  }
}