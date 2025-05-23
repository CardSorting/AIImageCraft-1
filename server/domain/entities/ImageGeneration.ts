export type AspectRatio = "1:1" | "16:9" | "9:16" | "3:4" | "4:3";

export interface ImageGenerationProps {
  id?: number;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  imageUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  seed?: string | null;
  createdAt?: Date;
}

export class ImageGeneration {
  private constructor(private props: Required<ImageGenerationProps>) {}

  static create(props: Omit<ImageGenerationProps, 'id' | 'createdAt'>): ImageGeneration {
    // Domain validation rules
    if (!props.prompt.trim()) {
      throw new Error('Prompt cannot be empty');
    }
    
    if (props.prompt.length > 500) {
      throw new Error('Prompt cannot exceed 500 characters');
    }
    
    if (!props.imageUrl.trim()) {
      throw new Error('Image URL is required');
    }
    
    return new ImageGeneration({
      id: 0, // Will be set by repository
      prompt: props.prompt.trim(),
      negativePrompt: props.negativePrompt?.trim() || "",
      aspectRatio: props.aspectRatio,
      imageUrl: props.imageUrl.trim(),
      fileName: props.fileName || null,
      fileSize: props.fileSize || null,
      seed: props.seed || null,
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: Required<ImageGenerationProps>): ImageGeneration {
    return new ImageGeneration(props);
  }

  // Getters
  get id(): number { return this.props.id; }
  get prompt(): string { return this.props.prompt; }
  get negativePrompt(): string { return this.props.negativePrompt; }
  get aspectRatio(): AspectRatio { return this.props.aspectRatio; }
  get imageUrl(): string { return this.props.imageUrl; }
  get fileName(): string | null { return this.props.fileName; }
  get fileSize(): number | null { return this.props.fileSize; }
  get seed(): string | null { return this.props.seed; }
  get createdAt(): Date { return this.props.createdAt; }

  // Domain methods
  updateImageUrl(newUrl: string): void {
    if (!newUrl.trim()) {
      throw new Error('Image URL cannot be empty');
    }
    this.props.imageUrl = newUrl.trim();
  }

  isRecent(): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.props.createdAt > oneHourAgo;
  }

  toPlainObject(): Required<ImageGenerationProps> {
    return { ...this.props };
  }
}