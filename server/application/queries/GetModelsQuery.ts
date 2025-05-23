/**
 * CQRS Query for Model Retrieval Operations
 * Follows Clean Architecture with clear domain boundaries
 */

export class GetModelsQuery {
  constructor(
    public readonly filter: 'all' | 'bookmarked' | 'for-you',
    public readonly userId?: number,
    public readonly sortBy: string = 'newest',
    public readonly limit: number = 20,
    public readonly searchQuery?: string
  ) {}

  validate(): boolean {
    if (this.filter === 'bookmarked' || this.filter === 'for-you') {
      return this.userId !== undefined && this.userId > 0;
    }
    return true;
  }

  getCacheKey(): string {
    const parts = [
      'models',
      this.filter,
      this.sortBy,
      this.limit.toString()
    ];
    
    if (this.userId) {
      parts.push(`user:${this.userId}`);
    }
    
    if (this.searchQuery) {
      parts.push(`search:${this.searchQuery}`);
    }
    
    return parts.join(':');
  }
}

export class GetBookmarkedModelsQuery {
  constructor(
    public readonly userId: number,
    public readonly limit: number = 50
  ) {}

  validate(): boolean {
    return this.userId > 0;
  }

  getCacheKey(): string {
    return `bookmarked_models:user:${this.userId}:limit:${this.limit}`;
  }
}

export class GetPersonalizedModelsQuery {
  constructor(
    public readonly userId: number,
    public readonly limit: number = 20
  ) {}

  validate(): boolean {
    return this.userId > 0;
  }

  getCacheKey(): string {
    return `personalized_models:user:${this.userId}:limit:${this.limit}`;
  }
}