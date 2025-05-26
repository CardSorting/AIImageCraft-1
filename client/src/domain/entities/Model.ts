/**
 * Model Domain Entity
 * Following DDD principles with Apple's design philosophy
 * - Simple, focused, and elegant
 * - Rich domain behavior encapsulated within entities
 */

export interface ModelStatistics {
  readonly likeCount: number;
  readonly bookmarkCount: number;
  readonly downloadCount: number;
  readonly viewCount: number;
  readonly engagementScore: number;
}

export interface ModelCapabilities {
  readonly supportedStyles: string[];
  readonly maxResolution: string;
  readonly averageGenerationTime: number;
  readonly qualityRating: number;
}

export interface ModelMetadata {
  readonly version: string;
  readonly lastUpdated: Date;
  readonly provider: string;
  readonly category: string;
  readonly tags: string[];
  readonly featured: boolean;
}

export class Model {
  constructor(
    public readonly id: number,
    public readonly modelId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly imageUrl: string,
    public readonly metadata: ModelMetadata,
    public readonly capabilities: ModelCapabilities,
    private _statistics: ModelStatistics
  ) {}

  get statistics(): ModelStatistics {
    return { ...this._statistics };
  }

  get isPopular(): boolean {
    return this._statistics.likeCount > 100 || this._statistics.downloadCount > 1000;
  }

  get isTrending(): boolean {
    return this._statistics.engagementScore > 75;
  }

  get displayCategory(): string {
    return this.metadata.category.charAt(0).toUpperCase() + this.metadata.category.slice(1);
  }

  get qualityTier(): 'premium' | 'standard' | 'basic' {
    if (this.capabilities.qualityRating >= 90) return 'premium';
    if (this.capabilities.qualityRating >= 70) return 'standard';
    return 'basic';
  }

  hasTag(tag: string): boolean {
    return this.metadata.tags.includes(tag.toLowerCase());
  }

  matchesSearchQuery(query: string): boolean {
    const searchTerms = query.toLowerCase().split(' ');
    const searchableText = [
      this.name,
      this.description,
      ...this.metadata.tags,
      this.metadata.category
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  }

  updateStatistics(newStats: Partial<ModelStatistics>): Model {
    const updatedStats = { ...this._statistics, ...newStats };
    return new Model(
      this.id,
      this.modelId,
      this.name,
      this.description,
      this.imageUrl,
      this.metadata,
      this.capabilities,
      updatedStats
    );
  }
}