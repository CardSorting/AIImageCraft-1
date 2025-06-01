// Value Objects - Immutable objects that represent concepts in the domain
export class EditPrompt {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Edit prompt cannot be empty');
    }
    if (value.length > 500) {
      throw new Error('Edit prompt cannot exceed 500 characters');
    }
  }

  public static create(value: string): EditPrompt {
    return new EditPrompt(value.trim());
  }

  public equals(other: EditPrompt): boolean {
    return this.value === other.value;
  }
}

export class ImageUrl {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Image URL cannot be empty');
    }
    // Basic URL validation
    try {
      new URL(value);
    } catch {
      // For data URLs (base64 images)
      if (!value.startsWith('data:image/')) {
        throw new Error('Invalid image URL format');
      }
    }
  }

  public static create(value: string): ImageUrl {
    return new ImageUrl(value);
  }

  public equals(other: ImageUrl): boolean {
    return this.value === other.value;
  }

  public isDataUrl(): boolean {
    return this.value.startsWith('data:image/');
  }
}

export class EditRequest {
  constructor(
    public readonly prompt: EditPrompt,
    public readonly imageUrl: ImageUrl,
    public readonly requestId: string = crypto.randomUUID()
  ) {}

  public static create(promptText: string, imageUrlValue: string): EditRequest {
    return new EditRequest(
      EditPrompt.create(promptText),
      ImageUrl.create(imageUrlValue)
    );
  }

  public equals(other: EditRequest): boolean {
    return this.prompt.equals(other.prompt) && 
           this.imageUrl.equals(other.imageUrl);
  }
}