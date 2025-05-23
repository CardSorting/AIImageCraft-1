/**
 * Model Statistics Application Service
 * Implements Clean Architecture and CQRS patterns
 * Orchestrates domain services and handles application logic
 */

import { StatisticsService, type IStatisticsService, type ModelStatistics } from "../../domain/services/StatisticsService";

/**
 * Application Service for Model Statistics
 * Follows Single Responsibility Principle (SRP)
 * Implements Interface Segregation Principle (ISP)
 */
export class ModelStatisticsApplicationService {
  private statisticsService: IStatisticsService;

  constructor(statisticsService?: IStatisticsService) {
    // Dependency Injection following Dependency Inversion Principle (DIP)
    this.statisticsService = statisticsService || new StatisticsService();
  }

  /**
   * Query Handler: Get Model Statistics
   * Implements CQRS Query pattern
   * @param modelId - The ID of the model to get statistics for
   * @returns Promise<ModelStatistics> - The model statistics
   */
  async handleGetModelStatistics(modelId: number): Promise<ModelStatistics> {
    try {
      // Validate input (Domain validation)
      if (!modelId || modelId <= 0) {
        throw new Error('Invalid model ID provided');
      }

      // Delegate to domain service
      const statistics = await this.statisticsService.getModelStatistics(modelId);
      
      // Application-level logging
      console.log(`Statistics retrieved for model ${modelId}:`, statistics);
      
      return statistics;
    } catch (error) {
      console.error('Error in ModelStatisticsApplicationService:', error);
      
      // Return safe defaults to maintain system stability
      return {
        modelId,
        likeCount: 0,
        bookmarkCount: 0
      };
    }
  }

  /**
   * Command Handler: Handle Like Action
   * Implements CQRS Command pattern
   */
  async handleLikeAction(modelId: number, isLiked: boolean): Promise<void> {
    try {
      if (isLiked) {
        await this.statisticsService.incrementLikeCount(modelId);
      } else {
        await this.statisticsService.decrementLikeCount(modelId);
      }
    } catch (error) {
      console.error('Error handling like action:', error);
      // Fail silently to maintain user experience
    }
  }

  /**
   * Command Handler: Handle Bookmark Action
   * Implements CQRS Command pattern
   */
  async handleBookmarkAction(modelId: number, isBookmarked: boolean): Promise<void> {
    try {
      if (isBookmarked) {
        await this.statisticsService.incrementBookmarkCount(modelId);
      } else {
        await this.statisticsService.decrementBookmarkCount(modelId);
      }
    } catch (error) {
      console.error('Error handling bookmark action:', error);
      // Fail silently to maintain user experience
    }
  }
}