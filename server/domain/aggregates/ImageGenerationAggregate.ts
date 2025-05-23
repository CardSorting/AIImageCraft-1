import { ImageDimensions } from '../value-objects/ImageDimensions';
import { Prompt } from '../value-objects/Prompt';
import { ImageGenerationOptions } from '../value-objects/ImageGenerationOptions';
import { DomainEvent } from '../events/DomainEvent';
import {
  ImageGenerationRequested,
  ImageGenerationStarted,
  ImageGenerationCompleted,
  ImageGenerationFailed,
  ImageGenerationCancelled
} from '../events/ImageGenerationEvents';

/**
 * Image Generation Status following Apple's clear, intuitive design
 */
export enum ImageGenerationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Image Generation Aggregate Root
 * Encapsulates business logic and maintains consistency
 * Follows Apple's philosophy of intuitive, user-focused design
 */
export class ImageGenerationAggregate {
  private _domainEvents: DomainEvent[] = [];
  private _status: ImageGenerationStatus = ImageGenerationStatus.PENDING;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _imageUrls: string[] = [];
  private _taskUUID?: string;
  private _error?: string;
  private _retryCount: number = 0;
  private _cost?: number;

  private constructor(
    private readonly _id: string,
    private readonly _prompt: Prompt,
    private readonly _negativePrompt: Prompt,
    private readonly _dimensions: ImageDimensions,
    private readonly _options: ImageGenerationOptions,
    private readonly _model: string,
    private readonly _createdAt: Date = new Date()
  ) {
    this.addDomainEvent(
      new ImageGenerationRequested(
        this._id,
        this._prompt.value,
        { width: this._dimensions.width, height: this._dimensions.height }
      )
    );
  }

  static create(
    id: string,
    prompt: string,
    negativePrompt: string = '',
    dimensions: ImageDimensions,
    options: ImageGenerationOptions,
    model: string
  ): ImageGenerationAggregate {
    const promptVo = Prompt.create(prompt);
    const negativePromptVo = negativePrompt ? Prompt.create(negativePrompt) : Prompt.createBlank();

    return new ImageGenerationAggregate(
      id,
      promptVo,
      negativePromptVo,
      dimensions,
      options,
      model
    );
  }

  // Getters following Apple's clear naming conventions
  get id(): string { return this._id; }
  get prompt(): Prompt { return this._prompt; }
  get negativePrompt(): Prompt { return this._negativePrompt; }
  get dimensions(): ImageDimensions { return this._dimensions; }
  get options(): ImageGenerationOptions { return this._options; }
  get model(): string { return this._model; }
  get status(): ImageGenerationStatus { return this._status; }
  get imageUrls(): string[] { return [...this._imageUrls]; }
  get taskUUID(): string | undefined { return this._taskUUID; }
  get error(): string | undefined { return this._error; }
  get retryCount(): number { return this._retryCount; }
  get cost(): number | undefined { return this._cost; }
  get createdAt(): Date { return this._createdAt; }
  get startedAt(): Date | undefined { return this._startedAt; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get domainEvents(): DomainEvent[] { return [...this._domainEvents]; }

  /**
   * Business Logic: Start image generation
   */
  startGeneration(taskUUID: string, estimatedDuration?: number): void {
    if (this._status !== ImageGenerationStatus.PENDING) {
      throw new Error(`Cannot start generation. Current status: ${this._status}`);
    }

    this._status = ImageGenerationStatus.IN_PROGRESS;
    this._taskUUID = taskUUID;
    this._startedAt = new Date();

    this.addDomainEvent(
      new ImageGenerationStarted(this._id, taskUUID, estimatedDuration)
    );
  }

  /**
   * Business Logic: Complete image generation
   */
  completeGeneration(imageUrls: string[], cost?: number): void {
    if (this._status !== ImageGenerationStatus.IN_PROGRESS) {
      throw new Error(`Cannot complete generation. Current status: ${this._status}`);
    }

    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('At least one image URL is required to complete generation');
    }

    this._status = ImageGenerationStatus.COMPLETED;
    this._imageUrls = [...imageUrls];
    this._completedAt = new Date();
    this._cost = cost;

    const generationTime = this._startedAt 
      ? this._completedAt.getTime() - this._startedAt.getTime()
      : 0;

    this.addDomainEvent(
      new ImageGenerationCompleted(this._id, imageUrls, generationTime, cost)
    );
  }

  /**
   * Business Logic: Handle generation failure
   */
  failGeneration(error: string): void {
    if (this._status === ImageGenerationStatus.COMPLETED) {
      throw new Error('Cannot fail a completed generation');
    }

    this._status = ImageGenerationStatus.FAILED;
    this._error = error;
    this._retryCount++;

    this.addDomainEvent(
      new ImageGenerationFailed(this._id, error, this._retryCount)
    );
  }

  /**
   * Business Logic: Cancel generation
   */
  cancelGeneration(reason: string): void {
    if (this._status === ImageGenerationStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed generation');
    }

    this._status = ImageGenerationStatus.CANCELLED;
    this._error = reason;

    this.addDomainEvent(
      new ImageGenerationCancelled(this._id, reason)
    );
  }

  /**
   * Business Logic: Check if can retry
   */
  canRetry(): boolean {
    return this._status === ImageGenerationStatus.FAILED && this._retryCount < 3;
  }

  /**
   * Business Logic: Reset for retry
   */
  resetForRetry(): void {
    if (!this.canRetry()) {
      throw new Error('Cannot retry this generation');
    }

    this._status = ImageGenerationStatus.PENDING;
    this._error = undefined;
    this._taskUUID = undefined;
    this._startedAt = undefined;
  }

  /**
   * Get generation duration in milliseconds
   */
  get duration(): number | undefined {
    if (!this._startedAt) return undefined;
    const endTime = this._completedAt || new Date();
    return endTime.getTime() - this._startedAt.getTime();
  }

  /**
   * Check if generation is in progress
   */
  get isInProgress(): boolean {
    return this._status === ImageGenerationStatus.IN_PROGRESS;
  }

  /**
   * Check if generation is complete
   */
  get isCompleted(): boolean {
    return this._status === ImageGenerationStatus.COMPLETED;
  }

  /**
   * Check if generation has failed
   */
  get hasFailed(): boolean {
    return this._status === ImageGenerationStatus.FAILED;
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}