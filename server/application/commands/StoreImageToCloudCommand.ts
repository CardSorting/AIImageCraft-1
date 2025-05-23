/**
 * Store Image to Cloud Command
 * Clean, focused command following Apple's design simplicity
 */

export class StoreImageToCloudCommand {
  constructor(
    public readonly sourceUrl: string,
    public readonly imageId: number,
    public readonly fileName?: string,
    public readonly metadata?: Record<string, string>
  ) {
    if (!sourceUrl?.trim()) {
      throw new Error('Source URL is required for cloud storage');
    }
    
    if (!imageId || imageId <= 0) {
      throw new Error('Valid image ID is required');
    }
  }

  get sanitizedFileName(): string | undefined {
    return this.fileName?.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  get operationId(): string {
    return `store_${this.imageId}_${Date.now()}`;
  }
}