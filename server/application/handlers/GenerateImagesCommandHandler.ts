import { GenerateImagesCommand } from '../commands/GenerateImagesCommand';
import { StoreImageToCloudCommand } from '../commands/StoreImageToCloudCommand';
import { StoreImageToCloudCommandHandler } from './StoreImageToCloudCommandHandler';
import { ImageGeneration } from '../../domain/entities/ImageGeneration';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';
import { IImageGenerationService } from '../../domain/services/IImageGenerationService';
import { ICloudStorageService } from '../../domain/services/ICloudStorageService';

export class GenerateImagesCommandHandler {
  private cloudStorageHandler: StoreImageToCloudCommandHandler;

  constructor(
    private readonly imageGenerationService: IImageGenerationService,
    private readonly imageRepository: IImageGenerationRepository,
    private readonly cloudStorageService: ICloudStorageService
  ) {
    this.cloudStorageHandler = new StoreImageToCloudCommandHandler(cloudStorageService, imageRepository);
  }

  async handle(command: GenerateImagesCommand): Promise<ImageGeneration[]> {
    console.log(`🎨 Generating ${command.numImages} image(s) with AI...`);
    
    // Generate images using external service
    const generatedResults = await this.imageGenerationService.generateImages({
      prompt: command.prompt,
      negativePrompt: command.negativePrompt,
      aspectRatio: command.aspectRatio,
      numImages: command.numImages
    });

    console.log(`✨ Generated ${generatedResults.length} images, now storing to B2...`);

    // Create domain entities and save to repository with B2 storage
    const savedImages: ImageGeneration[] = [];
    
    for (const result of generatedResults) {
      try {
        // For now, use FAL URL directly to prevent timeout
        // TODO: Implement background B2 storage later
        const imageGeneration = ImageGeneration.create({
          prompt: command.prompt,
          negativePrompt: command.negativePrompt,
          aspectRatio: command.aspectRatio,
          imageUrl: result.url, // Use FAL URL for immediate response
          fileName: result.fileName,
          fileSize: result.fileSize,
          seed: result.seed
        });

        const savedImage = await this.imageRepository.save(imageGeneration);
        savedImages.push(savedImage);
        
        console.log(`💾 Saved image: ${savedImage.fileName}`);
        
        // Store to cloud in background (non-blocking)
        console.log(`🔄 [DEBUG] Starting background cloud storage for image ${savedImage.id}`);
        this.storeToB2InBackground(result.url, savedImage.id, result.fileName);
        
      } catch (error: any) {
        console.error(`❌ Failed to save image: ${error.message}`);
        // Continue with other images even if one fails
      }
    }

    console.log(`🎉 Successfully processed ${savedImages.length}/${generatedResults.length} images`);
    return savedImages;
  }

  /**
   * Store image to B2 in background with comprehensive logging
   */
  private async storeToB2InBackground(falUrl: string, imageId: number, fileName?: string): Promise<void> {
    console.log(`🔍 [B2-DEBUG] Starting B2 storage for image ${imageId}`);
    console.log(`🔍 [B2-DEBUG] FAL URL: ${falUrl}`);
    console.log(`🔍 [B2-DEBUG] File name: ${fileName}`);
    
    try {
      // @ts-ignore
      const B2 = require('backblaze-b2');
      
      console.log(`🔐 [B2-DEBUG] Initializing B2 client for image ${imageId}`);
      const b2 = new B2({
        applicationKeyId: process.env.B2_APPLICATION_KEY_ID || '',
        applicationKey: process.env.B2_APPLICATION_KEY || '',
      });

      console.log(`🔐 [B2-DEBUG] Attempting B2 authorization for image ${imageId}`);
      await b2.authorize();
      console.log(`✅ [B2-DEBUG] B2 authorization successful for image ${imageId}`);

      // Download image from FAL
      console.log(`📥 [B2-DEBUG] Downloading image from FAL for image ${imageId}`);
      const response = await fetch(falUrl);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/png';
      console.log(`✅ [B2-DEBUG] Downloaded ${buffer.length} bytes for image ${imageId}`);

      // Generate filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = contentType.includes('png') ? '.png' : '.jpg';
      const finalFileName = fileName || `generated-${timestamp}-${randomString}${extension}`;

      // Upload to B2
      console.log(`☁️ [B2-DEBUG] Getting B2 upload URL for image ${imageId}`);
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: process.env.B2_BUCKET_ID,
      });

      console.log(`📤 [B2-DEBUG] Uploading to B2 for image ${imageId}`);
      await b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: finalFileName,
        data: buffer,
        info: { 'Content-Type': contentType },
      });

      // Update database with B2 URL
      const publicUrl = `https://f005.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${finalFileName}`;
      console.log(`🔄 [B2-DEBUG] Updating database with B2 URL for image ${imageId}`);
      
      const image = await this.imageRepository.findById(imageId);
      if (image) {
        image.updateImageUrl(publicUrl);
        await this.imageRepository.save(image);
        console.log(`🎉 [B2-DEBUG] Successfully stored image ${imageId} to B2: ${finalFileName}`);
      }

    } catch (error: any) {
      console.error(`❌ [B2-DEBUG] B2 storage failed for image ${imageId}:`, {
        error: error.message,
        stack: error.stack,
        falUrl,
        fileName
      });
    }
  }
}