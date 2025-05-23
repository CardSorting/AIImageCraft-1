/**
 * Cloudflare R2 Storage Service
 * Beautiful, fast cloud storage with Apple-style elegance
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { ICloudStorageService, StorageConfiguration, StorageHealthCheck, StorageUploadResult, StorageUploadRequest } from '../../domain/services/ICloudStorageService';

export class CloudflareR2StorageService implements ICloudStorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private accountId: string;

  constructor() {
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';
    this.accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
    
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
      },
    });

    this.log('INIT', '🚀 Initializing Cloudflare R2 service', {
      bucketName: this.bucketName,
      accountId: this.accountId,
      hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    });
  }

  private log(operation: string, message: string, data?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    console.log(`🔵 [R2-STORAGE] ${timestamp} - ${operation}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  private logError(operation: string, message: string, error?: any, data?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    console.error(`🔴 [R2-STORAGE] ${timestamp} - ${operation}: ${message}`, JSON.stringify({
      ...data,
      error: error?.message || error,
      stack: error?.stack
    }, null, 2));
  }

  private logSuccess(operation: string, message: string, startTime: number, data?: Record<string, any>): void {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    console.log(`✅ [R2-STORAGE] ${timestamp} - ${operation}: ${message}`, JSON.stringify({
      ...data,
      duration: `${duration}ms`
    }, null, 2));
  }

  async getConfiguration(): Promise<StorageConfiguration> {
    const startTime = Date.now();
    this.log('CONFIG', '🔍 Checking R2 configuration');

    const isConfigured = !!(
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      this.bucketName &&
      this.accountId
    );

    const config: StorageConfiguration = {
      isConfigured,
      provider: 'Cloudflare R2',
      bucketName: this.bucketName
    };

    this.logSuccess('CONFIG', 'Configuration check completed', startTime, config);
    return config;
  }

  async healthCheck(): Promise<StorageHealthCheck> {
    const startTime = Date.now();
    this.log('HEALTH', '🏥 Starting R2 health check');

    try {
      // Check configuration first
      const config = await this.getConfiguration();
      if (!config.isConfigured) {
        const result: StorageHealthCheck = {
          isHealthy: false,
          message: 'R2 service is not properly configured',
          timestamp: new Date(),
          details: config
        };
        this.logError('HEALTH', 'Health check failed - configuration issue', null, result);
        return result;
      }

      // Test bucket access with a simple head request
      const testKey = `health-check-${Date.now()}.txt`;
      try {
        await this.s3Client.send(new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: testKey
        }));
      } catch (error: any) {
        // 404 is expected for non-existent file, which means bucket access works
        if (error.name !== 'NotFound') {
          throw error;
        }
      }
      
      const result: StorageHealthCheck = {
        isHealthy: true,
        message: 'R2 service is healthy and accessible',
        timestamp: new Date(),
        details: {
          bucketName: this.bucketName,
          endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`
        }
      };

      this.logSuccess('HEALTH', 'Health check passed', startTime, result);
      return result;

    } catch (error: any) {
      const result: StorageHealthCheck = {
        isHealthy: false,
        message: `R2 health check failed: ${error.message}`,
        timestamp: new Date(),
        details: { error: error.message }
      };
      
      this.logError('HEALTH', 'Health check failed', error, result);
      return result;
    }
  }

  async downloadAndUpload(request: StorageUploadRequest): Promise<StorageUploadResult> {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();
    
    this.log('DOWNLOAD_UPLOAD', '🚀 Starting download and upload process', {
      uploadId,
      sourceUrl: request.sourceUrl,
      fileName: request.fileName
    });

    try {
      // Download image from source
      this.log('DOWNLOAD_UPLOAD', '📥 Downloading image from source', {
        uploadId,
        sourceUrl: request.sourceUrl
      });

      const response = await fetch(request.sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/png';
      
      this.log('DOWNLOAD_UPLOAD', '✅ Image downloaded successfully', {
        uploadId,
        fileSize: buffer.length,
        contentType
      });

      // Generate filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const extension = this.getFileExtension(contentType);
      const fileName = request.fileName || `generated-${timestamp}-${randomString}${extension}`;

      // Upload to R2
      this.log('DOWNLOAD_UPLOAD', '☁️ Uploading to R2', {
        uploadId,
        fileName,
        fileSize: buffer.length
      });

      const uploadResult = await this.uploadBuffer(buffer, fileName, contentType);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const result: StorageUploadResult = {
        success: true,
        url: uploadResult.url,
        fileName: uploadResult.fileName,
        fileSize: buffer.length,
        uploadId
      };

      this.logSuccess('DOWNLOAD_UPLOAD', 'Download and upload completed successfully', startTime, result);
      return result;

    } catch (error: any) {
      const result: StorageUploadResult = {
        success: false,
        uploadId,
        error: error.message
      };
      
      this.logError('DOWNLOAD_UPLOAD', 'Download and upload failed', error, { uploadId });
      return result;
    }
  }

  async uploadBuffer(buffer: Buffer, fileName: string, contentType: string): Promise<StorageUploadResult> {
    const uploadId = `buffer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();
    
    this.log('UPLOAD', '☁️ Starting buffer upload to R2', {
      uploadId,
      fileName,
      fileSize: buffer.length,
      contentType
    });

    try {
      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000', // 1 year cache
      });

      await this.s3Client.send(command);

      const publicUrl = this.getPublicUrl(fileName);
      const result: StorageUploadResult = {
        success: true,
        url: publicUrl,
        fileName: fileName,
        fileSize: buffer.length,
        uploadId
      };

      this.logSuccess('UPLOAD', 'Buffer upload completed successfully', startTime, result);
      return result;

    } catch (error: any) {
      const result: StorageUploadResult = {
        success: false,
        uploadId,
        error: error.message
      };
      
      this.logError('UPLOAD', 'Buffer upload failed', error, { uploadId, fileName });
      return result;
    }
  }

  getPublicUrl(fileName: string): string {
    const url = `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${fileName}`;
    this.log('URL', '🔗 Generated public URL', {
      fileName,
      url
    });
    return url;
  }

  async deleteFile(fileName: string): Promise<boolean> {
    const startTime = Date.now();
    this.log('DELETE', '🗑️ Starting file deletion', { fileName });

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName
      });

      await this.s3Client.send(command);

      this.logSuccess('DELETE', 'File deleted successfully', startTime, { fileName });
      return true;

    } catch (error: any) {
      this.logError('DELETE', 'File deletion failed', error, { fileName });
      return false;
    }
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