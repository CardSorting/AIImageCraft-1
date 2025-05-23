import { AspectRatio } from '../../domain/entities/ImageGeneration';

export class GenerateImagesCommand {
  constructor(
    public readonly prompt: string,
    public readonly negativePrompt: string = "",
    public readonly aspectRatio: AspectRatio = "1:1",
    public readonly numImages: number = 1
  ) {
    if (!prompt.trim()) {
      throw new Error('Prompt is required');
    }
    if (numImages < 1 || numImages > 4) {
      throw new Error('Number of images must be between 1 and 4');
    }
  }
}