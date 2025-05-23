/**
 * Store Image to Cloud Command Handler
 * Elegant background storage following Apple's design principles
 */

import { StoreImageToCloudCommand } from '../commands/StoreImageToCloudCommand';
import { ICloudStorageService } from '../../domain/services/ICloudStorageService';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';

export class StoreImageToCloudCommandHandler {
  constructor(
    private readonly cloudStorageService: ICloudStorageService,
    private readonly imageRepository: IImageGenerationRepository
  ) {}

  async handle(command: StoreImageToCloudCommand): Promise<void> {
    const startTime = Date.now();
    console.log(`🚀 [CLOUD-STORAGE] Starting background storage for image ${command.imageId}`);
    
    try {
      // First, check if cloud storage is healthy
      const healthCheck = await this.cloudStorageService.healthCheck();
      if (!healthCheck.isHealthy) {
        console.warn(`⚠️ [CLOUD-STORAGE] Storage service unhealthy: ${healthCheck.message}`);
        return; // Don't fail the process, just skip cloud storage
      }

      console.log(`☁️ [CLOUD-STORAGE] Uploading image ${command.imageId} to cloud storage...`);
      
      // Upload to cloud storage
      const uploadResult = await this.cloudStorageService.downloadAndUpload({
        sourceUrl: command.sourceUrl,
        fileName: command.sanitizedFileName,
        metadata: command.metadata
      });

      if (!uploadResult.success) {
        console.error(`❌ [CLOUD-STORAGE] Upload failed for image ${command.imageId}: ${uploadResult.error}`);
        return;
      }

      // Update the database with the cloud URL
      const image = await this.imageRepository.findById(command.imageId);
      if (image && uploadResult.url) {
        image.updateImageUrl(uploadResult.url);
        await this.imageRepository.save(image);
        
        const duration = Date.now() - startTime;
        console.log(`✅ [CLOUD-STORAGE] Successfully stored image ${command.imageId} to cloud (${duration}ms)`, {
          originalUrl: command.sourceUrl,
          cloudUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize
        });
      }

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`🔴 [CLOUD-STORAGE] Background storage failed for image ${command.imageId} (${duration}ms):`, {
        error: error.message,
        sourceUrl: command.sourceUrl
      });
      // Don't throw - this is background processing
    }
  }
}