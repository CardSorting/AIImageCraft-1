/**
 * CQRS Command for Bookmark Operations
 * Follows Clean Architecture with single responsibility
 */

export class ToggleBookmarkCommand {
  constructor(
    public readonly userId: number,
    public readonly modelId: number,
    public readonly timestamp: Date = new Date()
  ) {}

  validate(): boolean {
    return this.userId > 0 && this.modelId > 0;
  }

  getAggregateId(): string {
    return `user:${this.userId}:model:${this.modelId}`;
  }
}