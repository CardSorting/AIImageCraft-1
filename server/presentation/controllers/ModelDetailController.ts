/**
 * Model Detail Controller - Clean Architecture Presentation Layer
 * Follows Apple's philosophy of clear, purposeful interfaces
 * Implements SOLID principles with proper separation of concerns
 */

import { Request, Response } from 'express';
import { GetModelDetailQuery, GetModelEngagementQuery, GetModelImagesQuery } from '../../application/queries/GetModelDetailQuery.js';
import { 
  GetModelDetailQueryHandler, 
  ModelEngagementQueryHandler, 
  ModelImagesQueryHandler 
} from '../../application/handlers/GetModelDetailQueryHandler.js';

/**
 * Model Detail Controller
 * Follows Single Responsibility Principle (SRP)
 * Handles only HTTP concerns, delegates business logic to application services
 */
export class ModelDetailController {
  private readonly modelDetailHandler: GetModelDetailQueryHandler;
  private readonly engagementHandler: ModelEngagementQueryHandler;
  private readonly imagesHandler: ModelImagesQueryHandler;

  constructor() {
    // Use dynamic import to avoid circular dependency
    import('../../storage.js').then(({ storage }) => {
      this.modelDetailHandler = new GetModelDetailQueryHandler(storage);
      this.engagementHandler = new ModelEngagementQueryHandler(storage);
      this.imagesHandler = new ModelImagesQueryHandler(storage);
    });
  }

  /**
   * GET /api/v1/models/:id/detail
   * Returns comprehensive model information following Apple's data integrity principles
   */
  async getModelDetail(req: Request, res: Response): Promise<void> {
    try {
      const modelId = parseInt(req.params.id);
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

      if (isNaN(modelId)) {
        res.status(400).json({
          error: 'Invalid model ID',
          message: 'Model ID must be a valid number',
          code: 'INVALID_MODEL_ID'
        });
        return;
      }

      const query = new GetModelDetailQuery(modelId, userId);
      const result = await this.modelDetailHandler.handle(query);

      console.log(`[ModelDetailController] Retrieved detail for model ${modelId}`);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          modelId,
          userId,
          fetchedAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error(`[ModelDetailController] Failed to get model detail:`, error.message);

      if (error.message === 'Model not found') {
        res.status(404).json({
          success: false,
          error: 'Model not found',
          message: 'The requested model does not exist',
          code: 'MODEL_NOT_FOUND'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve model details',
        code: 'MODEL_DETAIL_FETCH_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * GET /api/v1/models/:id/engagement
   * Returns user engagement status with the model
   * Implements CQRS Query pattern at presentation layer
   */
  async getModelEngagement(req: Request, res: Response): Promise<void> {
    try {
      const modelId = parseInt(req.params.id);
      const userId = parseInt(req.query.userId as string);

      if (isNaN(modelId) || isNaN(userId)) {
        res.status(400).json({
          error: 'Invalid parameters',
          message: 'Model ID and User ID must be valid numbers',
          code: 'INVALID_ENGAGEMENT_PARAMS'
        });
        return;
      }

      const query = new GetModelEngagementQuery(modelId, userId);
      const result = await this.engagementHandler.handle(query);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error(`[ModelDetailController] Failed to get model engagement:`, error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve engagement status',
        code: 'ENGAGEMENT_FETCH_ERROR'
      });
    }
  }

  /**
   * GET /api/v1/models/:id/images
   * Returns images generated with this model
   * Follows Interface Segregation Principle (ISP)
   */
  async getModelImages(req: Request, res: Response): Promise<void> {
    try {
      const modelId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = parseInt(req.query.offset as string) || 0;

      if (isNaN(modelId)) {
        res.status(400).json({
          error: 'Invalid model ID',
          message: 'Model ID must be a valid number',
          code: 'INVALID_MODEL_ID'
        });
        return;
      }

      const query = new GetModelImagesQuery(modelId, limit, offset);
      const result = await this.imagesHandler.handle(query);

      console.log(`[ModelDetailController] Retrieved ${result.images.length} images for model ${modelId}`);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error(`[ModelDetailController] Failed to get model images:`, error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve model images',
        code: 'MODEL_IMAGES_FETCH_ERROR'
      });
    }
  }
}