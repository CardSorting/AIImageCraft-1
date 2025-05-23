/**
 * Domain Service for User Interactions
 * Follows DDD principles with rich domain logic for user engagement
 */

import { User } from '../entities/User.js';
import { AIModel } from '../entities/AIModel.js';

export interface UserInteractionData {
  userId: number;
  modelId: number;
  interactionType: string;
  isBookmarked: boolean;
  isLiked: boolean;
  engagementScore: number;
}

export interface IUserInteractionService {
  getUserModelInteractionState(userId: number, modelId: number): Promise<UserInteractionData>;
  toggleBookmark(userId: number, modelId: number): Promise<UserInteractionData>;
  toggleLike(userId: number, modelId: number): Promise<UserInteractionData>;
  calculateEngagementScore(interactions: any[]): number;
}

export class UserInteractionService implements IUserInteractionService {
  constructor(
    private storage: any // Will be injected via DI
  ) {}

  async getUserModelInteractionState(userId: number, modelId: number): Promise<UserInteractionData> {
    // Query current bookmark status
    const isBookmarked = await this.storage.isModelBookmarked(userId, modelId);
    
    // Query interaction history to determine if liked
    const interactions = await this.storage.getUserModelInteractions?.(userId, modelId) || [];
    const likeInteractions = interactions.filter((i: any) => i.interactionType === 'like');
    const isLiked = likeInteractions.length > 0 && likeInteractions[likeInteractions.length - 1].engagementLevel > 5;
    
    // Calculate engagement score based on interaction patterns
    const engagementScore = this.calculateEngagementScore(interactions);

    return {
      userId,
      modelId,
      interactionType: 'status_check',
      isBookmarked,
      isLiked,
      engagementScore
    };
  }

  async toggleBookmark(userId: number, modelId: number): Promise<UserInteractionData> {
    // Check current state
    const currentState = await this.getUserModelInteractionState(userId, modelId);
    
    // Toggle bookmark
    if (currentState.isBookmarked) {
      await this.storage.removeUserBookmark(userId, modelId);
    } else {
      await this.storage.createUserBookmark({ userId, modelId });
    }

    // Return updated state
    return this.getUserModelInteractionState(userId, modelId);
  }

  async toggleLike(userId: number, modelId: number): Promise<UserInteractionData> {
    // Check current state
    const currentState = await this.getUserModelInteractionState(userId, modelId);
    
    // Create like/unlike interaction
    const engagementLevel = currentState.isLiked ? 3 : 8; // Unlike vs Like
    await this.storage.createUserInteraction({
      userId,
      modelId,
      interactionType: 'like',
      engagementLevel,
      sessionDuration: 0,
      deviceType: 'web',
      referralSource: 'manual'
    });

    // Return updated state
    return this.getUserModelInteractionState(userId, modelId);
  }

  calculateEngagementScore(interactions: any[]): number {
    if (!interactions.length) return 0;
    
    const weights = {
      view: 1,
      like: 3,
      bookmark: 5,
      share: 4,
      download: 6
    };

    return interactions.reduce((score, interaction) => {
      const weight = weights[interaction.interactionType as keyof typeof weights] || 1;
      return score + (interaction.engagementLevel * weight);
    }, 0) / interactions.length;
  }
}