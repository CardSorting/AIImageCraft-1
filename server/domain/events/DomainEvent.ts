/**
 * Base Domain Event interface
 * Follows Apple's philosophy of simple, consistent interfaces
 */
export interface DomainEvent {
  readonly aggregateId: string;
  readonly eventType: string;
  readonly occurredOn: Date;
  readonly eventVersion: number;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string
  ) {
    this.occurredOn = new Date();
  }
}