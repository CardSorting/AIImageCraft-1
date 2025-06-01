/**
 * Style Library Query Handlers
 * CQRS Query Side - Read operations for style library
 * Following Apple's performance-first approach
 */

import { StyleLibrary, StyleCategory, CosplayStyle } from '@/domain/entities/StyleLibrary';

export interface GetAllCategoriesQuery {
  readonly type: 'GET_ALL_CATEGORIES';
}

export interface GetFeaturedCategoriesQuery {
  readonly type: 'GET_FEATURED_CATEGORIES';
  readonly limit?: number;
}

export interface GetCategoryByIdQuery {
  readonly type: 'GET_CATEGORY_BY_ID';
  readonly categoryId: string;
}

export interface GetStyleByIdQuery {
  readonly type: 'GET_STYLE_BY_ID';
  readonly styleId: string;
}

export interface SearchStylesQuery {
  readonly type: 'SEARCH_STYLES';
  readonly query: string;
  readonly categoryId?: string;
  readonly limit?: number;
}

export interface GetPopularStylesQuery {
  readonly type: 'GET_POPULAR_STYLES';
  readonly limit?: number;
}

export type StyleLibraryQuery = 
  | GetAllCategoriesQuery
  | GetFeaturedCategoriesQuery
  | GetCategoryByIdQuery
  | GetStyleByIdQuery
  | SearchStylesQuery
  | GetPopularStylesQuery;

export class StyleLibraryQueryHandler {
  constructor(private readonly styleLibrary: StyleLibrary) {}

  public handle(query: StyleLibraryQuery): unknown {
    switch (query.type) {
      case 'GET_ALL_CATEGORIES':
        return this.handleGetAllCategories();
      
      case 'GET_FEATURED_CATEGORIES':
        return this.handleGetFeaturedCategories(query.limit);
      
      case 'GET_CATEGORY_BY_ID':
        return this.handleGetCategoryById(query.categoryId);
      
      case 'GET_STYLE_BY_ID':
        return this.handleGetStyleById(query.styleId);
      
      case 'SEARCH_STYLES':
        return this.handleSearchStyles(query.query, query.categoryId, query.limit);
      
      case 'GET_POPULAR_STYLES':
        return this.handleGetPopularStyles(query.limit);
      
      default:
        throw new Error('Unknown query type');
    }
  }

  private handleGetAllCategories(): readonly StyleCategory[] {
    return this.styleLibrary.getCategories();
  }

  private handleGetFeaturedCategories(limit?: number): readonly StyleCategory[] {
    const featured = this.styleLibrary.getFeaturedCategories();
    return limit ? featured.slice(0, limit) : featured;
  }

  private handleGetCategoryById(categoryId: string): StyleCategory | null {
    return this.styleLibrary.getCategoryById(categoryId) || null;
  }

  private handleGetStyleById(styleId: string): CosplayStyle | null {
    return this.styleLibrary.getStyleById(styleId) || null;
  }

  private handleSearchStyles(
    query: string, 
    categoryId?: string, 
    limit?: number
  ): readonly CosplayStyle[] {
    let results: readonly CosplayStyle[];
    
    if (categoryId) {
      const category = this.styleLibrary.getCategoryById(categoryId);
      results = category ? category.searchStyles(query) : [];
    } else {
      results = this.styleLibrary.searchAllStyles(query);
    }
    
    return limit ? results.slice(0, limit) : results;
  }

  private handleGetPopularStyles(limit: number = 10): readonly CosplayStyle[] {
    return this.styleLibrary.getPopularStyles(limit);
  }
}