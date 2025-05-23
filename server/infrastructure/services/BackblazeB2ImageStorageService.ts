/**
 * Backblaze B2 Image Storage Service
 * Elegant, reliable cloud storage following Apple's design principles
 */

// @ts-ignore
const B2 = require('backblaze-b2');
import { IImageStorageService, ImageUploadResult, ImageDownloadOptions } from '../../domain/services/IImageStorageService';

export class BackblazeB2ImageStorageService implements IImageStorageService {
  private b2: any;
  private bucketName: string;
  private bucketId: string;
  private isAuthorized = false;
  private authPromise: Promise<void> | null = null;

  constructor() {
    this.bucketName = process.env.B2_BUCKET_NAME!;
    this.bucketId = process.env.B2_BUCKET_ID!;
    
    this.b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.B2_APPLICATION_KEY!,
    });

    if (!this.bucketName || !this.bucketId) {
      throw new Error('Backblaze B2 bucket configuration is missing');
    }
  }

  private async ensureAuthorized(): Promise<void> {
    if (this.isAuthorized) return;
    
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = this.authorize();
    return this.authPromise;
  }

  private async authorize(): Promise<void> {
    try {
      await this.b2.authorize();
      this.isAuthorized = true;
      this.authPromise = null;
      console.log('✓ Backblaze B2 authorized successfully');
    } catch (error: any) {
      this.authPromise = null;
      throw new Error(`B2 authorization failed: ${error.message}`);
    }
  }

  async downloadAndStore(options: ImageDownloadOptions): Promise<ImageUploadResult> {
    await this.ensureAuthorized();

    try {
      // Download image from URL
      const response = await fetch(options.url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/png';
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = this.getFileExtension(contentType);
      const fileName = options.fileName || `generated-${timestamp}-${randomString}${extension}`;

      return await this.uploadBuffer(buffer, fileName, contentType);
    } catch (error: any) {
      console.error('Image download and store error:', error);
      throw new Error(`Failed to download and store image: ${error.message}`);
    }
  }

  async uploadBuffer(buffer: Buffer, fileName: string, contentType: string): Promise<ImageUploadResult> {
    await this.ensureAuthorized();

    try {
      // Get upload URL
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      // Upload the file
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: fileName,
        data: buffer,
        info: {
          'Content-Type': contentType,
        },
      });

      const publicUrl = this.getPublicUrl(fileName);

      return {
        url: publicUrl,
        fileName: fileName,
        fileSize: buffer.length,
        contentType: contentType,
      };
    } catch (error: any) {
      console.error('B2 upload error:', error);
      throw new Error(`Failed to upload to B2: ${error.message}`);
    }
  }

  async deleteImage(fileName: string): Promise<boolean> {
    await this.ensureAuthorized();

    try {
      // First, find the file version
      const listResponse = await this.b2.listFileVersions({
        bucketId: this.bucketId,
        startFileName: fileName,
        maxFileCount: 1,
      });

      const file = listResponse.data.files.find((f: any) => f.fileName === fileName);
      if (!file) {
        return false; // File not found
      }

      // Delete the file
      await this.b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: fileName,
      });

      return true;
    } catch (error: any) {
      console.error('B2 delete error:', error);
      return false;
    }
  }

  getPublicUrl(fileName: string): string {
    // Backblaze B2 public URL format
    return `https://f005.backblazeb2.com/file/${this.bucketName}/${fileName}`;
  }

  private getFileExtension(contentType: string): string {
    const typeMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    
    return typeMap[contentType.toLowerCase()] || '.png';
  }
}