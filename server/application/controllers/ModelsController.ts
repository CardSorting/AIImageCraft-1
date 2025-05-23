/**
 * Models Controller - Clean Architecture Implementation
 * Follows SOLID principles with proper separation of concerns
 * Prevents routing collisions through structured endpoints
 */

import { Request, Response } from 'express';
import { 
  GetModelsQuery, 
  GetBookmarkedModelsQuery, 
  GetPersonalizedModelsQuery 
} from '../queries/GetModelsQuery.js';
import { 
  GetModelsQueryHandler, 
  GetBookmarkedModelsQueryHandler, 
  GetPersonalizedModelsQueryHandler 
} from '../handlers/GetModelsQueryHandler.js';

export class ModelsController {
  private readonly modelsHandler: GetModelsQueryHandler;
  private readonly bookmarkedHandler: GetBookmarkedModelsQueryHandler;
  private readonly personalizedHandler: GetPersonalizedModelsQueryHandler;

  constructor() {
    this.modelsHandler = new GetModelsQueryHandler();
    this.bookmarkedHandler = new GetBookmarkedModelsQueryHandler();
    this.personalizedHandler = new GetPersonalizedModelsQueryHandler();
  }

  /**
   * GET /api/v1/models/catalog
   * Handles all general model queries with proper filtering
   */
  async getCatalog(req: Request, res: Response): Promise<void> {
    try {
      const { 
        filter = 'all', 
        sortBy = 'newest', 
        limit = '20',
        userId = '1' 
      } = req.query;

      const query = new GetModelsQuery(
        filter as 'all' | 'bookmarked' | 'for-you',
        parseInt(userId as string),
        sortBy as string,
        parseInt(limit as string)
      );

      if (!query.validate()) {
        res.status(400).json({ 
          error: 'Invalid query parameters',
          code: 'INVALID_QUERY'
        });
        return;
      }

      const models = await this.modelsHandler.handle(query);
      
      // Return data in format expected by frontend
      res.json(models);
    } catch (error) {
      console.error('Error in getCatalog:', error);
      res.status(500).json({ 
        error: 'Failed to fetch models catalog',
        code: 'CATALOG_FETCH_ERROR'
      });
    }
  }

  /**
   * GET /api/v1/models/bookmarks/:userId
   * Dedicated endpoint for user bookmarks
   */
  async getBookmarked(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = '50' } = req.query;

      const query = new GetBookmarkedModelsQuery(
        parseInt(userId),
        parseInt(limit as string)
      );

      if (!query.validate()) {
        res.status(400).json({ 
          error: 'Invalid user ID or limit',
          code: 'INVALID_BOOKMARK_QUERY'
        });
        return;
      }

      const bookmarkedModels = await this.bookmarkedHandler.handle(query);
      
      // Return data in format expected by frontend
      res.json(bookmarkedModels);
    } catch (error) {
      console.error(`Error fetching bookmarked models for user ${req.params.userId}:`, error);
      res.status(500).json({ 
        error: 'Failed to fetch bookmarked models',
        code: 'BOOKMARKS_FETCH_ERROR'
      });
    }
  }

  /**
   * GET /api/v1/models/recommendations/:userId
   * Dedicated endpoint for personalized recommendations
   */
  async getPersonalized(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = '20' } = req.query;

      const query = new GetPersonalizedModelsQuery(
        parseInt(userId),
        parseInt(limit as string)
      );

      if (!query.validate()) {
        res.status(400).json({ 
          error: 'Invalid user ID or limit',
          code: 'INVALID_PERSONALIZED_QUERY'
        });
        return;
      }

      const personalizedModels = await this.personalizedHandler.handle(query);
      
      res.json({
        data: personalizedModels,
        meta: {
          userId: parseInt(userId),
          limit: parseInt(limit as string),
          count: personalizedModels.length,
          type: 'personalized'
        }
      });
    } catch (error) {
      console.error(`Error fetching personalized models for user ${req.params.userId}:`, error);
      res.status(500).json({ 
        error: 'Failed to fetch personalized recommendations',
        code: 'PERSONALIZED_FETCH_ERROR'
      });
    }
  }
}