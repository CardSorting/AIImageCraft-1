import { IImageGenerationAggregateRepository } from '../../domain/repositories/IImageGenerationAggregateRepository';
import { ImageGenerationAggregate } from '../../domain/aggregates/ImageGenerationAggregate';

/**
 * Get Image History Use Case
 * Retrieves user's image generation history with proper filtering
 * Follows Apple's philosophy of intuitive data presentation
 */
export interface GetImageHistoryRequest {
  readonly limit?: number;
  readonly offset?: number;
  readonly status?: string;
  readonly sortBy?: 'createdAt' | 'completedAt';
  readonly sortOrder?: 'asc' | 'desc';
}

export interface ImageHistoryItem {
  readonly id: string;
  readonly prompt: string;
  readonly status: string;
  readonly imageUrls: string[];
  readonly dimensions: { width: number; height: number };
  readonly createdAt: Date;
  readonly completedAt?: Date;
  readonly duration?: number;
  readonly cost?: number;
  readonly retryCount: number;
}

export interface GetImageHistoryResponse {
  readonly items: ImageHistoryItem[];
  readonly total: number;
  readonly hasMore: boolean;
}

export class GetImageHistoryUseCase {
  constructor(
    private readonly imageRepository: IImageGenerationAggregateRepository
  ) {}

  async execute(request: GetImageHistoryRequest = {}): Promise<GetImageHistoryResponse> {
    const {
      limit = 50,
      offset = 0,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = request;

    try {
      // Get aggregates from repository
      const aggregates = await this.imageRepository.findAll(limit + 1, offset); // +1 to check for more

      // Filter by status if specified
      const filteredAggregates = status 
        ? aggregates.filter(aggregate => aggregate.status === status)
        : aggregates;

      // Sort aggregates
      const sortedAggregates = this.sortAggregates(filteredAggregates, sortBy, sortOrder);

      // Check if there are more items
      const hasMore = sortedAggregates.length > limit;
      const items = sortedAggregates.slice(0, limit);

      // Transform to response format
      const historyItems = items.map(this.transformToHistoryItem);

      return {
        items: historyItems,
        total: filteredAggregates.length,
        hasMore
      };

    } catch (error: any) {
      throw new Error(`Failed to retrieve image history: ${error.message}`);
    }
  }

  private sortAggregates(
    aggregates: ImageGenerationAggregate[],
    sortBy: string,
    sortOrder: string
  ): ImageGenerationAggregate[] {
    return aggregates.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'completedAt':
          const aTime = a.completedAt?.getTime() || 0;
          const bTime = b.completedAt?.getTime() || 0;
          comparison = aTime - bTime;
          break;
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private transformToHistoryItem(aggregate: ImageGenerationAggregate): ImageHistoryItem {
    return {
      id: aggregate.id,
      prompt: aggregate.prompt.value,
      status: aggregate.status,
      imageUrls: aggregate.imageUrls,
      dimensions: {
        width: aggregate.dimensions.width,
        height: aggregate.dimensions.height
      },
      createdAt: aggregate.createdAt,
      completedAt: aggregate.completedAt,
      duration: aggregate.duration,
      cost: aggregate.cost,
      retryCount: aggregate.retryCount
    };
  }
}