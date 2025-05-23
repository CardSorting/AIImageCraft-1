/**
 * Store Image Command Handler
 * Elegant image storage with Apple-like attention to detail
 */

import { StoreImageCommand } from '../commands/StoreImageCommand';
import { IImageStorageService, ImageUploadResult } from '../../domain/services/IImageStorageService';

export class StoreImageCommandHandler {
  constructor(
    private readonly imageStorageService: IImageStorageService
  ) {}

  async handle(command: StoreImageCommand): Promise<ImageUploadResult> {
    try {
      console.log(`📥 Downloading and storing image: ${command.imageUrl}`);
      
      const result = await this.imageStorageService.downloadAndStore({
        url: command.imageUrl,
        fileName: command.sanitizedFileName
      });

      console.log(`✅ Image stored successfully: ${result.fileName}`);
      return result;
    } catch (error: any) {
      console.error('❌ Failed to store image:', error.message);
      throw new Error(`Image storage failed: ${error.message}`);
    }
  }
}