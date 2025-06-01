/**
 * Style Library Domain Entity
 * Following DDD principles with rich domain objects
 * Apple's Philosophy: Simple, elegant domain modeling with clear responsibilities
 */

export interface StyleMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
  readonly estimatedTime: number; // in minutes
  readonly popularity: number; // 0-100 scale
  readonly tags: readonly string[];
  readonly category: string;
  readonly subcategory?: string;
}

export interface StylePrompt {
  readonly positive: string;
  readonly negative?: string;
  readonly enhancementTips?: readonly string[];
}

export interface StyleAssets {
  readonly previewImage?: string;
  readonly thumbnailImage?: string;
  readonly iconName: string;
  readonly colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface StyleAccessibility {
  readonly isPremium: boolean;
  readonly requiredCredits: number;
  readonly minimumTier: 'free' | 'pro' | 'premium';
  readonly restrictions?: readonly string[];
}

export class CosplayStyle {
  constructor(
    public readonly metadata: StyleMetadata,
    public readonly prompt: StylePrompt,
    public readonly assets: StyleAssets,
    public readonly accessibility: StyleAccessibility,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  get isPopular(): boolean {
    return this.metadata.popularity >= 70;
  }

  get isDifficult(): boolean {
    return this.metadata.difficulty === 'advanced';
  }

  get isAccessibleToUser(): boolean {
    return !this.accessibility.isPremium || this.accessibility.minimumTier === 'free';
  }

  hasTag(tag: string): boolean {
    return this.metadata.tags.includes(tag.toLowerCase());
  }

  belongsToCategory(category: string): boolean {
    return this.metadata.category.toLowerCase() === category.toLowerCase();
  }

  calculateRelevanceScore(userPreferences: readonly string[]): number {
    const tagMatches = userPreferences.filter(pref => this.hasTag(pref)).length;
    const popularityBonus = this.isPopular ? 0.2 : 0;
    const baseScore = (tagMatches / Math.max(userPreferences.length, 1)) + popularityBonus;
    
    return Math.min(baseScore, 1.0);
  }
}

export interface StyleCategoryMetadata {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly iconName: string;
  readonly themeColor: string;
  readonly isFeatured: boolean;
  readonly sortOrder: number;
}

export class StyleCategory {
  constructor(
    public readonly metadata: StyleCategoryMetadata,
    private readonly _styles: readonly CosplayStyle[] = []
  ) {}

  get styles(): readonly CosplayStyle[] {
    return this._styles;
  }

  get styleCount(): number {
    return this._styles.length;
  }

  get popularStyles(): readonly CosplayStyle[] {
    return this._styles.filter(style => style.isPopular);
  }

  get freeStyles(): readonly CosplayStyle[] {
    return this._styles.filter(style => style.isAccessibleToUser);
  }

  getStyleById(id: string): CosplayStyle | undefined {
    return this._styles.find(style => style.metadata.id === id);
  }

  getStylesByDifficulty(difficulty: StyleMetadata['difficulty']): readonly CosplayStyle[] {
    return this._styles.filter(style => style.metadata.difficulty === difficulty);
  }

  searchStyles(query: string): readonly CosplayStyle[] {
    const lowerQuery = query.toLowerCase();
    return this._styles.filter(style => 
      style.metadata.name.toLowerCase().includes(lowerQuery) ||
      style.metadata.description.toLowerCase().includes(lowerQuery) ||
      style.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

export interface StyleLibraryStats {
  readonly totalStyles: number;
  readonly totalCategories: number;
  readonly popularStylesCount: number;
  readonly freeStylesCount: number;
  readonly premiumStylesCount: number;
}

export class StyleLibrary {
  constructor(
    private readonly _categories: readonly StyleCategory[] = []
  ) {}

  get categories(): readonly StyleCategory[] {
    return this._categories.sort((a, b) => a.metadata.sortOrder - b.metadata.sortOrder);
  }

  get featuredCategories(): readonly StyleCategory[] {
    return this._categories.filter(cat => cat.metadata.isFeatured);
  }

  get allStyles(): readonly CosplayStyle[] {
    return this._categories.flatMap(cat => cat.styles);
  }

  get stats(): StyleLibraryStats {
    const allStyles = this.allStyles;
    return {
      totalStyles: allStyles.length,
      totalCategories: this._categories.length,
      popularStylesCount: allStyles.filter(s => s.isPopular).length,
      freeStylesCount: allStyles.filter(s => s.isAccessibleToUser).length,
      premiumStylesCount: allStyles.filter(s => !s.isAccessibleToUser).length
    };
  }

  getCategoryById(id: string): StyleCategory | undefined {
    return this._categories.find(cat => cat.metadata.id === id);
  }

  getStyleById(id: string): CosplayStyle | undefined {
    for (const category of this._categories) {
      const style = category.getStyleById(id);
      if (style) return style;
    }
    return undefined;
  }

  searchStyles(query: string): readonly CosplayStyle[] {
    return this._categories.flatMap(cat => cat.searchStyles(query));
  }

  getStylesByCategory(categoryId: string): readonly CosplayStyle[] {
    const category = this.getCategoryById(categoryId);
    return category ? category.styles : [];
  }

  getRecommendations(userPreferences: readonly string[], limit = 10): readonly CosplayStyle[] {
    return this.allStyles
      .map(style => ({
        style,
        relevance: style.calculateRelevanceScore(userPreferences)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(item => item.style);
  }

  getTrendingStyles(limit = 10): readonly CosplayStyle[] {
    return this.allStyles
      .sort((a, b) => b.metadata.popularity - a.metadata.popularity)
      .slice(0, limit);
  }
}