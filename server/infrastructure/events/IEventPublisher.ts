/**
 * Event Publisher Interface
 * Defines contract for domain event publishing
 */

export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  data: Record<string, any>;
  timestamp: Date;
  version: number;
}

export interface IEventPublisher {
  publish(eventType: string, data: Record<string, any>): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}