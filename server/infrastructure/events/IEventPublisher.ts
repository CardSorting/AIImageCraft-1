/**
 * Event Publisher Interface
 * Domain events for credit system following Event-Driven Architecture
 */

export interface DomainEvent {
  eventType: string;
  eventId: string;
  userId: number;
  timestamp: Date;
  data: Record<string, any>;
}

export interface IEventPublisher {
  publish(eventType: string, data: Record<string, any>): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}