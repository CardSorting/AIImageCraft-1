import { ImageGenerationAggregate } from '../../domain/aggregates/ImageGenerationAggregate';
import { ImageDimensions } from '../../domain/value-objects/ImageDimensions';
import { ImageGenerationOptions } from '../../domain/value-objects/ImageGenerationOptions';
import { IImageGenerationAggregateRepository } from '../../domain/repositories/IImageGenerationAggregateRepository';
import { IImageGenerationService } from '../../domain/services/IImageGenerationService';
import { DomainEvent } from '../../domain/events/DomainEvent';

/**
 * Generate Image Use Case
 * Orchestrates the complete image generation workflow
 * Follows Apple's philosophy of seamless user experience
 */
export interface GenerateImageRequest {
  readonly prompt: string;
  readonly negativePrompt?: string;
  readonly aspectRatio: string;
  readonly model?: string;
  readonly options?: Partial<{
    steps: number;
    cfgScale: number;
    seed: number;
    scheduler: string;
    clipSkip: number;
    promptWeighting: string;
    numberResults: number;
    outputType: 'URL' | 'base64Data' | 'dataURI';
    outputFormat: 'JPG' | 'PNG' | 'WEBP';
    outputQuality: number;
    checkNSFW: boolean;
  }>;
}

export interface GenerateImageResponse {
  readonly id: string;
  readonly status: string;
  readonly taskUUID?: string;
  readonly imageUrls: string[];
  readonly prompt: string;
  readonly dimensions: { width: number; height: number };
  readonly createdAt: Date;
  readonly cost?: number;
  readonly domainEvents: DomainEvent[];
}

export class GenerateImageUseCase {
  constructor(
    private readonly imageRepository: IImageGenerationAggregateRepository,
    private readonly imageGenerationService: IImageGenerationService
  ) {}

  async execute(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      // Create value objects with validation
      const dimensions = ImageDimensions.fromAspectRatio(request.aspectRatio);
      const options = ImageGenerationOptions.create(request.options || {});
      const model = request.model || "runware:100@1";

      // Create aggregate with domain logic
      const aggregate = ImageGenerationAggregate.create(
        this.generateId(),
        request.prompt,
        request.negativePrompt || '',
        dimensions,
        options,
        model
      );

      // Persist the initial state
      await this.imageRepository.save(aggregate);

      // Start generation process
      const taskUUID = this.generateTaskUUID();
      aggregate.startGeneration(taskUUID);

      try {
        // Call external service
        const serviceRequest = {
          prompt: request.prompt,
          negativePrompt: request.negativePrompt,
          aspectRatio: request.aspectRatio,
          numImages: options.numberResults
        };

        const results = await this.imageGenerationService.generateImages(serviceRequest);
        
        // Complete generation with results
        const imageUrls = results.map(result => result.url);
        aggregate.completeGeneration(imageUrls, this.calculateCost(results));

      } catch (serviceError: any) {
        // Handle service failure gracefully
        aggregate.failGeneration(serviceError.message || 'Image generation service failed');
      }

      // Persist final state
      await this.imageRepository.save(aggregate);

      // Return response with domain events for further processing
      return {
        id: aggregate.id,
        status: aggregate.status,
        taskUUID: aggregate.taskUUID,
        imageUrls: aggregate.imageUrls,
        prompt: aggregate.prompt.value,
        dimensions: {
          width: aggregate.dimensions.width,
          height: aggregate.dimensions.height
        },
        createdAt: aggregate.createdAt,
        cost: aggregate.cost,
        domainEvents: aggregate.domainEvents
      };

    } catch (error: any) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTaskUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private calculateCost(results: any[]): number {
    // Simple cost calculation - can be enhanced based on actual Runware pricing
    return results.length * 0.01; // $0.01 per image
  }
}