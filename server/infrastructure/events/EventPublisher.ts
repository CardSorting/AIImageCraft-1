/**
 * Event Publisher Implementation
 * Simple in-memory event publisher for domain events
 */

import { IEventPublisher, DomainEvent } from "./IEventPublisher";
import { nanoid } from "nanoid";

export class EventPublisher implements IEventPublisher {
  private eventHandlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();

  async publish(eventType: string, data: Record<string, any>): Promise<void> {
    const event: DomainEvent = {
      eventType,
      aggregateId: nanoid(),
      data,
      timestamp: new Date(),
      version: 1
    };

    console.log(`Publishing event: ${eventType}`, event);

    const handlers = this.eventHandlers.get(eventType) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(event => this.publish(event.eventType, event.data)));
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }
}