// Infrastructure Layer - Adapter following Dependency Inversion Principle
import { IImageEditService, EditResult } from '../../../domain/ai-designer/services/IImageEditService';
import { EditRequest } from '../../../domain/ai-designer/value-objects/EditRequest';
import { ImageData } from '../../../domain/ai-designer/entities/ImageEditSession';

export class FluxImageEditService implements IImageEditService {
  constructor(
    private readonly apiClient: IFluxApiClient,
    private readonly configService: IConfigService
  ) {}

  async editImage(request: EditRequest): Promise<EditResult> {
    try {
      const response = await this.apiClient.editImage({
        prompt: request.prompt.value,
        imageUrl: request.imageUrl.value,
        model: this.configService.getDefaultModel(),
        quality: this.configService.getImageQuality()
      });

      if (response.success && response.imageUrl) {
        const imageData: ImageData = {
          url: response.imageUrl,
          width: response.width,
          height: response.height,
          format: response.format || 'png'
        };

        return {
          success: true,
          imageData,
          requestId: request.requestId
        };
      } else {
        return {
          success: false,
          error: response.error || 'Image editing failed',
          requestId: request.requestId
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        requestId: request.requestId
      };
    }
  }

  async validateImageFormat(imageUrl: string): Promise<boolean> {
    try {
      if (imageUrl.startsWith('data:image/')) {
        // Validate data URL format
        const validFormats = ['jpeg', 'jpg', 'png', 'webp'];
        return validFormats.some(format => imageUrl.includes(`data:image/${format}`));
      }

      // For external URLs, check if accessible and valid image
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return Boolean(contentType?.startsWith('image/'));
    } catch {
      return false;
    }
  }

  estimateProcessingTime(request: EditRequest): number {
    // Estimate based on image complexity and prompt length
    const baseTime = 5000; // 5 seconds base
    const promptComplexity = Math.min(request.prompt.value.length / 10, 5000);
    return baseTime + promptComplexity;
  }
}

export interface IFluxApiClient {
  editImage(params: FluxEditParams): Promise<FluxEditResponse>;
}

export interface FluxEditParams {
  prompt: string;
  imageUrl: string;
  model: string;
  quality: string;
}

export interface FluxEditResponse {
  success: boolean;
  imageUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

export interface IConfigService {
  getDefaultModel(): string;
  getImageQuality(): string;
  getApiKey(): string;
  getApiEndpoint(): string;
}