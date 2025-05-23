/**
 * CQRS Query Handler for Model Retrieval Operations
 * Implements Clean Architecture with Domain-Driven Design
 */

import { GetModelsQuery, GetBookmarkedModelsQuery, GetPersonalizedModelsQuery } from '../queries/GetModelsQuery.js';
import { storage } from '../../storage.js';
import { AIModel } from '../../../shared/schema.js';

export interface IGetModelsQueryHandler {
  handle(query: GetModelsQuery): Promise<AIModel[]>;
}

export interface IGetBookmarkedModelsQueryHandler {
  handle(query: GetBookmarkedModelsQuery): Promise<AIModel[]>;
}

export interface IGetPersonalizedModelsQueryHandler {
  handle(query: GetPersonalizedModelsQuery): Promise<AIModel[]>;
}

/**
 * Handler for general model queries following SOLID principles
 * Single Responsibility: Only handles model retrieval
 * Open/Closed: Extensible for new filter types
 * Dependency Inversion: Depends on storage abstraction
 */
export class GetModelsQueryHandler implements IGetModelsQueryHandler {
  async handle(query: GetModelsQuery): Promise<AIModel[]> {
    if (!query.validate()) {
      throw new Error('Invalid query parameters');
    }

    try {
      switch (query.filter) {
        case 'all':
          return await storage.getAIModels(query.limit, query.sortBy);
        
        case 'bookmarked':
          if (!query.userId) {
            throw new Error('User ID required for bookmarked models');
          }
          return await storage.getBookmarkedModels(query.userId, query.limit);
        
        case 'for-you':
          if (!query.userId) {
            throw new Error('User ID required for personalized models');
          }
          return await storage.getForYouModels(query.userId, query.limit);
        
        default:
          throw new Error(`Unsupported filter type: ${query.filter}`);
      }
    } catch (error) {
      console.error(`Error handling GetModelsQuery:`, error);
      throw error;
    }
  }
}

/**
 * Specialized handler for bookmarked models
 * Follows Single Responsibility Principle
 */
export class GetBookmarkedModelsQueryHandler implements IGetBookmarkedModelsQueryHandler {
  async handle(query: GetBookmarkedModelsQuery): Promise<AIModel[]> {
    if (!query.validate()) {
      throw new Error('Invalid bookmarked models query');
    }

    try {
      return await storage.getBookmarkedModels(query.userId, query.limit);
    } catch (error) {
      console.error(`Error fetching bookmarked models for user ${query.userId}:`, error);
      throw error;
    }
  }
}

/**
 * Specialized handler for personalized model recommendations
 * Integrates with recommendation engine
 */
export class GetPersonalizedModelsQueryHandler implements IGetPersonalizedModelsQueryHandler {
  async handle(query: GetPersonalizedModelsQuery): Promise<AIModel[]> {
    if (!query.validate()) {
      throw new Error('Invalid personalized models query');
    }

    try {
      return await storage.getForYouModels(query.userId, query.limit);
    } catch (error) {
      console.error(`Error fetching personalized models for user ${query.userId}:`, error);
      throw error;
    }
  }
}