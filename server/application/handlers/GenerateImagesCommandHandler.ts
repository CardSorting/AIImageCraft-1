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
        // Store image in B2 and get permanent URL
        const storeCommand = new StoreImageCommand(result.url, result.fileName);
        const storageResult = await this.storeImageHandler.handle(storeCommand);

        // Create domain entity with B2 URL
        const imageGeneration = ImageGeneration.create({
          prompt: command.prompt,
          negativePrompt: command.negativePrompt,
          aspectRatio: command.aspectRatio,
          imageUrl: storageResult.url, // Use B2 URL instead of FAL URL
          fileName: storageResult.fileName,
          fileSize: storageResult.fileSize,
          seed: result.seed
        });

        const savedImage = await this.imageRepository.save(imageGeneration);
        savedImages.push(savedImage);
        
        console.log(`💾 Saved image: ${savedImage.fileName}`);
      } catch (error: any) {
        console.error(`❌ Failed to store image: ${error.message}`);
        // Continue with other images even if one fails
      }
    }

    console.log(`🎉 Successfully processed ${savedImages.length}/${generatedResults.length} images`);
    return savedImages;
  }
}