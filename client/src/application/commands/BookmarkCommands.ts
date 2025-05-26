/**
 * CQRS Commands for Bookmark Operations
 * Application Layer - Orchestrates Business Logic
 * 
 * Apple Philosophy: "Simple things should be simple, complex things should be possible"
 * ✓ Clear Command Intent
 * ✓ Immutable Command Objects
 * ✓ Built-in Validation
 * ✓ Type Safety
 */

export class CreateBookmarkCommand {
  constructor(
    public readonly userId: number,
    public readonly modelId: number,
    public readonly timestamp: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (this.modelId <= 0) {
      throw new Error('Invalid model ID');
    }
  }

  getAggregateId(): string {
    return `bookmark_${this.userId}_${this.modelId}`;
  }
}

export class RemoveBookmarkCommand {
  constructor(
    public readonly userId: number,
    public readonly modelId: number,
    public readonly timestamp: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (this.modelId <= 0) {
      throw new Error('Invalid model ID');
    }
  }

  getAggregateId(): string {
    return `bookmark_${this.userId}_${this.modelId}`;
  }
}

export class ToggleBookmarkCommand {
  constructor(
    public readonly userId: number,
    public readonly modelId: number,
    public readonly timestamp: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (this.modelId <= 0) {
      throw new Error('Invalid model ID');
    }
  }

  getAggregateId(): string {
    return `bookmark_${this.userId}_${this.modelId}`;
  }
}