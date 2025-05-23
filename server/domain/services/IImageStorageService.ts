/**
 * Image Storage Service Interface
 * Following Apple's design philosophy: Simple, elegant, and reliable
 */

export interface ImageUploadResult {
  readonly url: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly contentType: string;
}

export interface ImageDownloadOptions {
  readonly url: string;
  readonly fileName?: string;
}

export interface IImageStorageService {
  /**
   * Downloads an image from a URL and uploads it to permanent storage
   * @param options Download and storage options
   * @returns Promise resolving to upload result
   */
  downloadAndStore(options: ImageDownloadOptions): Promise<ImageUploadResult>;

  /**
   * Uploads a buffer directly to storage
   * @param buffer Image buffer
   * @param fileName Desired file name
   * @param contentType MIME type
   * @returns Promise resolving to upload result
   */
  uploadBuffer(buffer: Buffer, fileName: string, contentType: string): Promise<ImageUploadResult>;

  /**
   * Deletes an image from storage
   * @param fileName File name to delete
   * @returns Promise resolving to success status
   */
  deleteImage(fileName: string): Promise<boolean>;

  /**
   * Generates a public URL for an image
   * @param fileName File name
   * @returns Public URL string
   */
  getPublicUrl(fileName: string): string;
}