// Domain Service Interface - Following Interface Segregation Principle
import { EditRequest } from '../value-objects/EditRequest';
import { ImageData } from '../entities/ImageEditSession';

export interface EditResult {
  success: boolean;
  imageData?: ImageData;
  error?: string;
  requestId: string;
}

export interface IImageEditService {
  editImage(request: EditRequest): Promise<EditResult>;
  validateImageFormat(imageUrl: string): Promise<boolean>;
  estimateProcessingTime(request: EditRequest): number;
}

// Domain Events - Following Domain-Driven Design principles
export interface DomainEvent {
  eventId: string;
  occurredOn: Date;
  eventType: string;
}

export interface ImageEditStartedEvent extends DomainEvent {
  eventType: 'ImageEditStarted';
  data: {
    requestId: string;
    prompt: string;
  };
}

export interface ImageEditCompletedEvent extends DomainEvent {
  eventType: 'ImageEditCompleted';
  data: {
    requestId: string;
    resultImageUrl: string;
  };
}

export interface ImageEditFailedEvent extends DomainEvent {
  eventType: 'ImageEditFailed';
  data: {
    requestId: string;
    error: string;
  };
}

export type ImageEditEvent = ImageEditStartedEvent | ImageEditCompletedEvent | ImageEditFailedEvent;