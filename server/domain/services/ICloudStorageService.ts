/**
 * Cloud Storage Service Interface
 * Elegant abstraction following Apple's design principles
 */

export interface StorageConfiguration {
  readonly isConfigured: boolean;
  readonly provider: string;
  readonly bucketName?: string;
}

export interface StorageHealthCheck {
  readonly isHealthy: boolean;
  readonly message: string;
  readonly timestamp: Date;
  readonly details?: Record<string, any>;
}

export interface StorageUploadResult {
  readonly success: boolean;
  readonly url?: string;
  readonly fileName?: string;
  readonly fileSize?: number;
  readonly uploadId: string;
  readonly error?: string;
}

export interface StorageUploadRequest {
  readonly sourceUrl: string;
  readonly fileName?: string;
  readonly metadata?: Record<string, string>;
}

/**
 * Clean, focused interface for cloud storage operations
 * Following the Interface Segregation Principle
 */
export interface ICloudStorageService {
  /**
   * Checks if the storage service is properly configured
   */
  getConfiguration(): Promise<StorageConfiguration>;

  /**
   * Performs a health check on the storage service
   */
  healthCheck(): Promise<StorageHealthCheck>;

  /**
   * Downloads from source URL and uploads to cloud storage
   */
  downloadAndUpload(request: StorageUploadRequest): Promise<StorageUploadResult>;

  /**
   * Uploads a buffer directly to storage
   */
  uploadBuffer(buffer: Buffer, fileName: string, contentType: string): Promise<StorageUploadResult>;

  /**
   * Generates a public URL for a stored file
   */
  getPublicUrl(fileName: string): string;

  /**
   * Deletes a file from storage
   */
  deleteFile(fileName: string): Promise<boolean>;
}