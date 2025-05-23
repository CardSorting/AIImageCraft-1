import { BaseDomainEvent } from './DomainEvent';

/**
 * Domain Events for Image Generation
 * Each event represents a significant business occurrence
 */
export class ImageGenerationRequested extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly prompt: string,
    public readonly dimensions: { width: number; height: number },
    public readonly requestedBy?: string
  ) {
    super(aggregateId, 'ImageGenerationRequested');
  }
}

export class ImageGenerationStarted extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly taskUUID: string,
    public readonly estimatedDuration?: number
  ) {
    super(aggregateId, 'ImageGenerationStarted');
  }
}

export class ImageGenerationCompleted extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly imageUrls: string[],
    public readonly generationTime: number,
    public readonly cost?: number
  ) {
    super(aggregateId, 'ImageGenerationCompleted');
  }
}

export class ImageGenerationFailed extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly error: string,
    public readonly retryAttempt: number
  ) {
    super(aggregateId, 'ImageGenerationFailed');
  }
}

export class ImageGenerationCancelled extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    public readonly reason: string
  ) {
    super(aggregateId, 'ImageGenerationCancelled');
  }
}