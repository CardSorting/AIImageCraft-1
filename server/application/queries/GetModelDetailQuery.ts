/**
 * Model Detail Query - CQRS Implementation
 * Follows Apple's philosophy of clear, purposeful design
 * Implements Single Responsibility Principle
 */

export class GetModelDetailQuery {
  constructor(
    public readonly modelId: number,
    public readonly userId?: number
  ) {
    if (modelId <= 0) {
      throw new Error('Model ID must be a positive number');
    }
  }

  validate(): boolean {
    return this.modelId > 0;
  }
}

/**
 * Query for model engagement data
 * Separates concerns following CQRS pattern
 */
export class GetModelEngagementQuery {
  constructor(
    public readonly modelId: number,
    public readonly userId: number
  ) {
    if (modelId <= 0 || userId <= 0) {
      throw new Error('Model ID and User ID must be positive numbers');
    }
  }

  validate(): boolean {
    return this.modelId > 0 && this.userId > 0;
  }
}

/**
 * Query for model generated images
 * Follows Domain-Driven Design principles
 */
export class GetModelImagesQuery {
  constructor(
    public readonly modelId: number,
    public readonly limit: number = 12,
    public readonly offset: number = 0
  ) {
    if (modelId <= 0) {
      throw new Error('Model ID must be a positive number');
    }
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  validate(): boolean {
    return this.modelId > 0 && this.limit > 0 && this.limit <= 100 && this.offset >= 0;
  }
}