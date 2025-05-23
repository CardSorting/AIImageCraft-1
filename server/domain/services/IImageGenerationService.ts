import { AspectRatio } from '../entities/ImageGeneration';

export interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  numImages: number;
}

export interface GeneratedImageResult {
  url: string;
  fileName?: string;
  fileSize?: number;
  seed?: number;
}

export interface IImageGenerationService {
  generateImages(request: GenerateImageRequest): Promise<GeneratedImageResult[]>;
}