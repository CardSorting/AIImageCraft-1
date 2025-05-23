/**
 * Enhanced Backblaze B2 Storage Service
 * Beautiful, robust cloud storage with comprehensive logging
 * Following Apple's design philosophy: Simple, elegant, reliable
 */

// @ts-ignore
const B2 = require('backblaze-b2');
import { ICloudStorageService, StorageConfiguration, StorageHealthCheck, StorageUploadResult, StorageUploadRequest } from '../../domain/services/ICloudStorageService';

export class EnhancedBackblazeB2Service implements ICloudStorageService {
  private b2: any;
  private bucketName: string;
  private bucketId: string;
  private isAuthorized = false;
  private authPromise: Promise<void> | null = null;

  constructor() {
    this.bucketName = process.env.B2_BUCKET_NAME || '';
    this.bucketId = process.env.B2_BUCKET_ID || '';
    
    this.b2 = new B2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID || '',
      applicationKey: process.env.B2_APPLICATION_KEY || '',
    });

    this.log('INIT', '🔧 Initializing B2 service', {
      bucketName: this.bucketName,
      bucketId: this.bucketId,
      hasKeyId: !!process.env.B2_APPLICATION_KEY_ID,
      hasKey: !!process.env.B2_APPLICATION_KEY
    });
  }

  private log(operation: string, message: string, data?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    console.log(`🔵 [B2-STORAGE] ${timestamp} - ${operation}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  private logError(operation: string, message: string, error?: any, data?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    console.error(`🔴 [B2-STORAGE] ${timestamp} - ${operation}: ${message}`, JSON.stringify({
      ...data,
      error: error?.message || error,
      stack: error?.stack
    }, null, 2));
  }

  private logSuccess(operation: string, message: string, startTime: number, data?: Record<string, any>): void {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    console.log(`✅ [B2-STORAGE] ${timestamp} - ${operation}: ${message}`, JSON.stringify({
      ...data,
      duration: `${duration}ms`
    }, null, 2));
  }

  async getConfiguration(): Promise<StorageConfiguration> {
    const startTime = Date.now();
    this.log('CONFIG', '🔍 Checking B2 configuration');

    const isConfigured = !!(
      process.env.B2_APPLICATION_KEY_ID &&
      process.env.B2_APPLICATION_KEY &&
      this.bucketName &&
      this.bucketId
    );

    const config: StorageConfiguration = {
      isConfigured,
      provider: 'Backblaze B2',
      bucketName: this.bucketName
    };

    this.logSuccess('CONFIG', 'Configuration check completed', startTime, config);
    return config;
  }

  async healthCheck(): Promise<StorageHealthCheck> {
    const startTime = Date.now();
    this.log('HEALTH', '🏥 Starting B2 health check');

    try {
      // Check configuration first
      const config = await this.getConfiguration();
      if (!config.isConfigured) {
        const result: StorageHealthCheck = {
          isHealthy: false,
          message: 'B2 service is not properly configured',
          timestamp: new Date(),
          details: config
        };
        this.logError('HEALTH', 'Health check failed - configuration issue', null, result);
        return result;
      }

      // Test authorization
      await this.ensureAuthorized();
      
      const result: StorageHealthCheck = {
        isHealthy: true,
        message: 'B2 service is healthy and authorized',
        timestamp: new Date(),
        details: {
          bucketName: this.bucketName,
          authenticated: this.isAuthorized
        }
      };

      this.logSuccess('HEALTH', 'Health check passed', startTime, result);
      return result;

    } catch (error: any) {
      const result: StorageHealthCheck = {
        isHealthy: false,
        message: `B2 health check failed: ${error.message}`,
        timestamp: new Date(),
        details: { error: error.message }
      };
      
      this.logError('HEALTH', 'Health check failed', error, result);
      return result;
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
    const startTime = Date.now();
    this.log('AUTH', '🔐 Starting B2 authorization');

    try {
      await this.b2.authorize();
      this.isAuthorized = true;
      this.authPromise = null;
      
      this.logSuccess('AUTH', 'B2 authorization successful', startTime, {
        bucketName: this.bucketName
      });
    } catch (error: any) {
      this.authPromise = null;
      this.logError('AUTH', 'B2 authorization failed', error, {
        bucketName: this.bucketName,
        hasCredentials: !!(process.env.B2_APPLICATION_KEY_ID && process.env.B2_APPLICATION_KEY)
      });
      throw new Error(`B2 authorization failed: ${error.message}`);
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
      await this.ensureAuthorized();

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

      // Upload to B2
      this.log('DOWNLOAD_UPLOAD', '☁️ Uploading to B2', {
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
    
    this.log('UPLOAD', '☁️ Starting buffer upload to B2', {
      uploadId,
      fileName,
      fileSize: buffer.length,
      contentType
    });

    try {
      await this.ensureAuthorized();

      // Get upload URL
      this.log('UPLOAD', '🔗 Getting B2 upload URL', { uploadId });
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      // Upload the file
      this.log('UPLOAD', '📤 Uploading file to B2', {
        uploadId,
        fileName,
        uploadUrl: uploadUrlResponse.data.uploadUrl
      });

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
    const url = `https://f005.backblazeb2.com/file/${this.bucketName}/${fileName}`;
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
      await this.ensureAuthorized();

      // Find the file version
      const listResponse = await this.b2.listFileVersions({
        bucketId: this.bucketId,
        startFileName: fileName,
        maxFileCount: 1,
      });

      const file = listResponse.data.files.find((f: any) => f.fileName === fileName);
      if (!file) {
        this.log('DELETE', '⚠️ File not found for deletion', { fileName });
        return false;
      }

      // Delete the file
      await this.b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: fileName,
      });

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