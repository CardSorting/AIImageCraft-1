/**
 * Style Library Domain Entity
 * Core business logic for cosplay style management
 * Following Domain-Driven Design principles
 */

export interface StyleId {
  readonly value: string;
}

export interface StyleMetadata {
  readonly name: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly premium: boolean;
  readonly popularity: number;
}

export interface StylePrompt {
  readonly positive: string;
  readonly negative?: string;
}

export interface StyleVisuals {
  readonly iconName: string;
  readonly previewImage?: string;
  readonly color?: string;
}

export class CosplayStyle {
  constructor(
    public readonly id: StyleId,
    public readonly metadata: StyleMetadata,
    public readonly prompt: StylePrompt,
    public readonly visuals: StyleVisuals
  ) {}

  public isPopular(): boolean {
    return this.metadata.popularity >= 0.8;
  }

  public isPremium(): boolean {
    return this.metadata.premium;
  }

  public matchesTag(tag: string): boolean {
    return this.metadata.tags.includes(tag.toLowerCase());
  }

  public getSearchableText(): string {
    return [
      this.metadata.name,
      this.metadata.description,
      ...this.metadata.tags
    ].join(' ').toLowerCase();
  }
}

export interface CategoryId {
  readonly value: string;
}

export interface CategoryMetadata {
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly featured: boolean;
  readonly color?: string;
}

export class StyleCategory {
  constructor(
    public readonly id: CategoryId,
    public readonly metadata: CategoryMetadata,
    public readonly iconName: string,
    private readonly styles: readonly CosplayStyle[]
  ) {}

  public getStyles(): readonly CosplayStyle[] {
    return this.styles;
  }

  public getPopularStyles(limit: number = 4): readonly CosplayStyle[] {
    return this.styles
      .filter(style => style.isPopular())
      .slice(0, limit);
  }

  public searchStyles(query: string): readonly CosplayStyle[] {
    const searchTerm = query.toLowerCase();
    return this.styles.filter(style => 
      style.getSearchableText().includes(searchTerm)
    );
  }

  public getStyleCount(): number {
    return this.styles.length;
  }
}

export class StyleLibrary {
  constructor(
    private readonly categories: readonly StyleCategory[]
  ) {}

  public getCategories(): readonly StyleCategory[] {
    return this.categories;
  }

  public getFeaturedCategories(): readonly StyleCategory[] {
    return this.categories.filter(category => category.metadata.featured);
  }

  public getCategoryById(id: string): StyleCategory | undefined {
    return this.categories.find(category => category.id.value === id);
  }

  public getStyleById(styleId: string): CosplayStyle | undefined {
    for (const category of this.categories) {
      const style = category.getStyles().find(s => s.id.value === styleId);
      if (style) return style;
    }
    return undefined;
  }

  public getAllStyles(): readonly CosplayStyle[] {
    return this.categories.flatMap(category => category.getStyles());
  }

  public getPopularStyles(limit: number = 10): readonly CosplayStyle[] {
    return [...this.getAllStyles()]
      .filter(style => style.isPopular())
      .sort((a: CosplayStyle, b: CosplayStyle) => b.metadata.popularity - a.metadata.popularity)
      .slice(0, limit);
  }

  public searchAllStyles(query: string): readonly CosplayStyle[] {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return this.getAllStyles().filter(style => 
      style.getSearchableText().includes(searchTerm)
    );
  }
}