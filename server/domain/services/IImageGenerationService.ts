import { AspectRatio } from '../entities/ImageGeneration';

export interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  numImages: number;
  model?: string;
  loras?: Array<{
    model: string;
    weight: number;
  }>;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  scheduler?: string;
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