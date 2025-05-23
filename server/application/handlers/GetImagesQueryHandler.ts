import { GetImagesQuery } from '../queries/GetImagesQuery';
import { ImageGeneration } from '../../domain/entities/ImageGeneration';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';

export class GetImagesQueryHandler {
  constructor(
    private readonly imageRepository: IImageGenerationRepository
  ) {}

  async handle(query: GetImagesQuery): Promise<ImageGeneration[]> {
    return await this.imageRepository.findAll(query.limit);
  }
}