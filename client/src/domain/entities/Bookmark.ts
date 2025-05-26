/**
 * Bookmark Domain Entity
 * Follows Apple's "It Just Works" Philosophy - Simple, Elegant, Predictable
 * 
 * Core Principles:
 * ✓ Immutable Value Objects
 * ✓ Rich Domain Logic
 * ✓ Zero Dependencies on Infrastructure
 * ✓ Self-Validating Business Rules
 */

export class BookmarkId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('BookmarkId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: BookmarkId): boolean {
    return this.value === other.value;
  }
}

export class UserId {
  constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('UserId must be positive');
    }
  }

  toNumber(): number {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

export class ModelId {
  constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('ModelId must be positive');
    }
  }

  toNumber(): number {
    return this.value;
  }

  equals(other: ModelId): boolean {
    return this.value === other.value;
  }
}

export interface BookmarkSnapshot {
  id: string;
  userId: number;
  modelId: number;
  createdAt: Date;
  isActive: boolean;
}

/**
 * Bookmark Aggregate Root
 * Encapsulates all business logic for bookmark operations
 */
export class Bookmark {
  private constructor(
    private readonly id: BookmarkId,
    private readonly userId: UserId,
    private readonly modelId: ModelId,
    private readonly createdAt: Date,
    private isActive: boolean = true
  ) {}

  // Factory Method - Apple's preference for clear, intention-revealing constructors
  static create(userId: number, modelId: number): Bookmark {
    return new Bookmark(
      new BookmarkId(`bookmark_${userId}_${modelId}_${Date.now()}`),
      new UserId(userId),
      new ModelId(modelId),
      new Date(),
      true
    );
  }

  static fromSnapshot(snapshot: BookmarkSnapshot): Bookmark {
    return new Bookmark(
      new BookmarkId(snapshot.id),
      new UserId(snapshot.userId),
      new ModelId(snapshot.modelId),
      snapshot.createdAt,
      snapshot.isActive
    );
  }

  // Business Logic Methods
  activate(): void {
    if (this.isActive) {
      throw new Error('Bookmark is already active');
    }
    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new Error('Bookmark is already inactive');
    }
    this.isActive = false;
  }

  isOwnedBy(userId: number): boolean {
    return this.userId.equals(new UserId(userId));
  }

  belongsToModel(modelId: number): boolean {
    return this.modelId.equals(new ModelId(modelId));
  }

  // Getters following Apple's clear naming conventions
  getId(): string {
    return this.id.toString();
  }

  getUserId(): number {
    return this.userId.toNumber();
  }

  getModelId(): number {
    return this.modelId.toNumber();
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  // Snapshot for persistence
  toSnapshot(): BookmarkSnapshot {
    return {
      id: this.id.toString(),
      userId: this.userId.toNumber(),
      modelId: this.modelId.toNumber(),
      createdAt: new Date(this.createdAt),
      isActive: this.isActive
    };
  }

  // Domain Events (for future event sourcing)
  static createBookmarkCreatedEvent(bookmark: Bookmark) {
    return {
      type: 'BookmarkCreated',
      aggregateId: bookmark.getId(),
      userId: bookmark.getUserId(),
      modelId: bookmark.getModelId(),
      timestamp: new Date()
    };
  }

  static createBookmarkRemovedEvent(bookmark: Bookmark) {
    return {
      type: 'BookmarkRemoved',
      aggregateId: bookmark.getId(),
      userId: bookmark.getUserId(),
      modelId: bookmark.getModelId(),
      timestamp: new Date()
    };
  }
}