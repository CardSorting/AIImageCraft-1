import { GenerateImagesCommand } from '../commands/GenerateImagesCommand';
import { ImageGeneration } from '../../domain/entities/ImageGeneration';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';
import { IImageGenerationService } from '../../domain/services/IImageGenerationService';

export class GenerateImagesCommandHandler {
  constructor(
    private readonly imageGenerationService: IImageGenerationService,
    private readonly imageRepository: IImageGenerationRepository
  ) {}

  async handle(command: GenerateImagesCommand): Promise<ImageGeneration[]> {
    // Generate images using external service
    const generatedResults = await this.imageGenerationService.generateImages({
      prompt: command.prompt,
      negativePrompt: command.negativePrompt,
      aspectRatio: command.aspectRatio,
      numImages: command.numImages
    });

    // Create domain entities and save to repository
    const savedImages: ImageGeneration[] = [];
    
    for (const result of generatedResults) {
      const imageGeneration = ImageGeneration.create({
        prompt: command.prompt,
        negativePrompt: command.negativePrompt,
        aspectRatio: command.aspectRatio,
        imageUrl: result.url,
        fileName: result.fileName,
        fileSize: result.fileSize,
        seed: result.seed
      });

      const savedImage = await this.imageRepository.save(imageGeneration);
      savedImages.push(savedImage);
    }

    return savedImages;
  }
}