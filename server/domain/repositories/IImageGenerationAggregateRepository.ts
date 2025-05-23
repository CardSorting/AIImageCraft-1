import { ImageGenerationAggregate } from '../aggregates/ImageGenerationAggregate';

/**
 * Repository interface for Image Generation Aggregate
 * Follows Apple's philosophy of clear, purposeful interfaces
 * Implements Repository pattern from DDD
 */
export interface IImageGenerationAggregateRepository {
  save(aggregate: ImageGenerationAggregate): Promise<ImageGenerationAggregate>;
  findById(id: string): Promise<ImageGenerationAggregate | null>;
  findAll(limit?: number, offset?: number): Promise<ImageGenerationAggregate[]>;
  findByStatus(status: string, limit?: number): Promise<ImageGenerationAggregate[]>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}