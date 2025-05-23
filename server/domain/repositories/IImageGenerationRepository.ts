import { ImageGeneration } from '../entities/ImageGeneration';

export interface IImageGenerationRepository {
  save(imageGeneration: ImageGeneration): Promise<ImageGeneration>;
  findById(id: number): Promise<ImageGeneration | null>;
  findAll(limit?: number): Promise<ImageGeneration[]>;
  delete(id: number): Promise<boolean>;
}