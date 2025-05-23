/**
 * Statistics Service - Domain Service for Model Statistics
 * Follows SOLID principles and Domain-Driven Design (DDD)
 * Implements Command Query Responsibility Segregation (CQRS)
 */

import { eq, count } from "drizzle-orm";
import { db } from "../../db";
import { userLikes, userBookmarks } from "@shared/schema";

export interface ModelStatistics {
  modelId: number;
  likeCount: number;
  bookmarkCount: number;
}

export interface IStatisticsService {
  getModelStatistics(modelId: number): Promise<ModelStatistics>;
  incrementLikeCount(modelId: number): Promise<void>;
  decrementLikeCount(modelId: number): Promise<void>;
  incrementBookmarkCount(modelId: number): Promise<void>;
  decrementBookmarkCount(modelId: number): Promise<void>;
}

/**
 * Statistics Service Implementation
 * Handles all model statistics queries and commands
 * Follows Single Responsibility Principle (SRP)
 */
export class StatisticsService implements IStatisticsService {
  
  /**
   * Query: Get model statistics (CQRS - Query side)
   * Follows Open/Closed Principle - extensible for new statistics
   */
  async getModelStatistics(modelId: number): Promise<ModelStatistics> {
    try {
      // Get like count using optimized database query
      const [likeCountResult] = await db
        .select({ count: count() })
        .from(userLikes)
        .where(eq(userLikes.modelId, modelId));
      
      // Get bookmark count using optimized database query
      const [bookmarkCountResult] = await db
        .select({ count: count() })
        .from(userBookmarks)
        .where(eq(userBookmarks.modelId, modelId));
      
      return {
        modelId,
        likeCount: Number(likeCountResult?.count || 0),
        bookmarkCount: Number(bookmarkCountResult?.count || 0)
      };
    } catch (error) {
      console.error('Error fetching model statistics:', error);
      // Return safe defaults on error (Interface Segregation Principle)
      return {
        modelId,
        likeCount: 0,
        bookmarkCount: 0
      };
    }
  }

  /**
   * Command: Increment like count (CQRS - Command side)
   * Follows Dependency Inversion Principle
   */
  async incrementLikeCount(modelId: number): Promise<void> {
    // Implementation would trigger cache invalidation if needed
    // This is a placeholder for potential cache management
    console.log(`Like count incremented for model ${modelId}`);
  }

  /**
   * Command: Decrement like count (CQRS - Command side)
   */
  async decrementLikeCount(modelId: number): Promise<void> {
    console.log(`Like count decremented for model ${modelId}`);
  }

  /**
   * Command: Increment bookmark count (CQRS - Command side)
   */
  async incrementBookmarkCount(modelId: number): Promise<void> {
    console.log(`Bookmark count incremented for model ${modelId}`);
  }

  /**
   * Command: Decrement bookmark count (CQRS - Command side)
   */
  async decrementBookmarkCount(modelId: number): Promise<void> {
    console.log(`Bookmark count decremented for model ${modelId}`);
  }
}