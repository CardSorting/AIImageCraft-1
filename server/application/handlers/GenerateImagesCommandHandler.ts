import { GenerateImagesCommand } from '../commands/GenerateImagesCommand';
import { StoreImageCommand } from '../commands/StoreImageCommand';
import { StoreImageCommandHandler } from './StoreImageCommandHandler';
import { ImageGeneration } from '../../domain/entities/ImageGeneration';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';
import { IImageGenerationService } from '../../domain/services/IImageGenerationService';
import { IImageStorageService } from '../../domain/services/IImageStorageService';

export class GenerateImagesCommandHandler {
  private storeImageHandler: StoreImageCommandHandler;

  constructor(
    private readonly imageGenerationService: IImageGenerationService,
    private readonly imageRepository: IImageGenerationRepository,
    private readonly imageStorageService: IImageStorageService
  ) {
    this.storeImageHandler = new StoreImageCommandHandler(imageStorageService);
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
        
        // Store to B2 in background (non-blocking)
        this.storeImageInBackground(result.url, result.fileName, savedImage.id);
        
      } catch (error: any) {
        console.error(`❌ Failed to save image: ${error.message}`);
        // Continue with other images even if one fails
      }
    }

    console.log(`🎉 Successfully processed ${savedImages.length}/${generatedResults.length} images`);
    return savedImages;
  }

  /**
   * Store image to B2 in background without blocking the response
   */
  private async storeImageInBackground(falUrl: string, fileName: string | undefined, imageId: number): Promise<void> {
    try {
      const storeCommand = new StoreImageCommand(falUrl, fileName);
      const storageResult = await this.storeImageHandler.handle(storeCommand);
      
      // Update the database with the B2 URL
      const image = await this.imageRepository.findById(imageId);
      if (image) {
        image.updateImageUrl(storageResult.url);
        await this.imageRepository.save(image);
        console.log(`🔄 Updated image ${imageId} with B2 URL: ${storageResult.fileName}`);
      }
    } catch (error: any) {
      console.error(`⚠️ Background B2 storage failed for image ${imageId}:`, error.message);
      // Don't throw - this is background processing
    }
  }
}