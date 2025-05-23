/**
 * Data Transfer Objects for Image Generation
 * Clean separation between domain and presentation layers
 * Following Apple's philosophy of clear, purposeful interfaces
 */

export interface CreateImageGenerationDTO {
  readonly prompt: string;
  readonly negativePrompt?: string;
  readonly aspectRatio: string;
  readonly model?: string;
  readonly steps?: number;
  readonly cfgScale?: number;
  readonly seed?: number;
  readonly scheduler?: string;
  readonly clipSkip?: number;
  readonly promptWeighting?: string;
  readonly numberResults?: number;
  readonly outputType?: 'URL' | 'base64Data' | 'dataURI';
  readonly outputFormat?: 'JPG' | 'PNG' | 'WEBP';
  readonly outputQuality?: number;
  readonly checkNSFW?: boolean;
}

export interface ImageGenerationResponseDTO {
  readonly id: string;
  readonly prompt: string;
  readonly negativePrompt?: string;
  readonly status: string;
  readonly imageUrls: string[];
  readonly dimensions: {
    readonly width: number;
    readonly height: number;
  };
  readonly model: string;
  readonly taskUUID?: string;
  readonly createdAt: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly duration?: number;
  readonly cost?: number;
  readonly retryCount: number;
  readonly error?: string;
}

export interface ImageHistoryQueryDTO {
  readonly limit?: number;
  readonly offset?: number;
  readonly status?: string;
  readonly sortBy?: 'createdAt' | 'completedAt';
  readonly sortOrder?: 'asc' | 'desc';
}

export interface ImageHistoryResponseDTO {
  readonly items: ImageGenerationResponseDTO[];
  readonly pagination: {
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
    readonly hasMore: boolean;
  };
}