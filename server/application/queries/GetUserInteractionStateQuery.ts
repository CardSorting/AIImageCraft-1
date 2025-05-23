/**
 * CQRS Query for User Interaction State
 * Follows Clean Architecture with read-side optimization
 */

export class GetUserInteractionStateQuery {
  constructor(
    public readonly userId: number,
    public readonly modelId: number
  ) {}

  validate(): boolean {
    return this.userId > 0 && this.modelId > 0;
  }

  getKey(): string {
    return `user_interaction:${this.userId}:${this.modelId}`;
  }
}

export class GetBulkUserInteractionStateQuery {
  constructor(
    public readonly userId: number,
    public readonly modelIds: number[]
  ) {}

  validate(): boolean {
    return this.userId > 0 && this.modelIds.length > 0 && this.modelIds.every(id => id > 0);
  }

  getKey(): string {
    return `bulk_user_interaction:${this.userId}:${this.modelIds.join(',')}`;
  }
}