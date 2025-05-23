/**
 * Statistics Controller - Presentation Layer
 * Implements Clean Architecture and follows SOLID principles
 * Handles HTTP requests and responses for model statistics
 */

import { Request, Response } from "express";
import { ModelStatisticsApplicationService } from "../../application/services/ModelStatisticsApplicationService";

/**
 * Statistics Controller
 * Follows Single Responsibility Principle (SRP)
 * Handles only HTTP concerns, delegates business logic to application services
 */
export class StatisticsController {
  private modelStatisticsService: ModelStatisticsApplicationService;

  constructor(modelStatisticsService?: ModelStatisticsApplicationService) {
    // Dependency Injection following Dependency Inversion Principle (DIP)
    this.modelStatisticsService = modelStatisticsService || new ModelStatisticsApplicationService();
  }

  /**
   * GET /api/models/:modelId/stats
   * Returns statistics for a specific model
   * Implements CQRS Query pattern at presentation layer
   */
  async getModelStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Extract and validate request parameters
      const modelId = parseInt(req.params.modelId);
      
      if (isNaN(modelId)) {
        res.status(400).json({ 
          error: "Invalid model ID", 
          message: "Model ID must be a valid number" 
        });
        return;
      }

      // Delegate to application service
      const statistics = await this.modelStatisticsService.handleGetModelStatistics(modelId);
      
      // Return successful response
      res.status(200).json(statistics);
      
    } catch (error) {
      console.error('Error in StatisticsController.getModelStatistics:', error);
      
      // Return error response with safe fallback
      res.status(500).json({ 
        error: "Failed to fetch model statistics",
        message: "An error occurred while retrieving statistics"
      });
    }
  }

  /**
   * POST /api/models/:modelId/stats/like
   * Handle like action for a model
   * Implements CQRS Command pattern at presentation layer
   */
  async handleLikeAction(req: Request, res: Response): Promise<void> {
    try {
      const modelId = parseInt(req.params.modelId);
      const { isLiked } = req.body;
      
      if (isNaN(modelId)) {
        res.status(400).json({ error: "Invalid model ID" });
        return;
      }

      // Delegate to application service
      await this.modelStatisticsService.handleLikeAction(modelId, isLiked);
      
      res.status(200).json({ 
        success: true, 
        message: `Model ${isLiked ? 'liked' : 'unliked'} successfully` 
      });
      
    } catch (error) {
      console.error('Error in StatisticsController.handleLikeAction:', error);
      res.status(500).json({ error: "Failed to handle like action" });
    }
  }

  /**
   * POST /api/models/:modelId/stats/bookmark
   * Handle bookmark action for a model
   * Implements CQRS Command pattern at presentation layer
   */
  async handleBookmarkAction(req: Request, res: Response): Promise<void> {
    try {
      const modelId = parseInt(req.params.modelId);
      const { isBookmarked } = req.body;
      
      if (isNaN(modelId)) {
        res.status(400).json({ error: "Invalid model ID" });
        return;
      }

      // Delegate to application service
      await this.modelStatisticsService.handleBookmarkAction(modelId, isBookmarked);
      
      res.status(200).json({ 
        success: true, 
        message: `Model ${isBookmarked ? 'bookmarked' : 'unbookmarked'} successfully` 
      });
      
    } catch (error) {
      console.error('Error in StatisticsController.handleBookmarkAction:', error);
      res.status(500).json({ error: "Failed to handle bookmark action" });
    }
  }
}