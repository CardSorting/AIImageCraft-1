/**
 * Store Image Command
 * Clean, focused command for storing images with Apple-like simplicity
 */

export class StoreImageCommand {
  constructor(
    public readonly imageUrl: string,
    public readonly fileName?: string
  ) {
    if (!imageUrl?.trim()) {
      throw new Error('Image URL is required');
    }
  }

  get sanitizedFileName(): string | undefined {
    return this.fileName?.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}