/**
 * Track User Interaction Command Handler - CQRS Pattern
 * Following Apple's philosophy of seamless experience tracking
 * Implements Clean Architecture command handling with SOLID principles
 */

import { TrackUserInteractionCommand } from '../commands/TrackUserInteractionCommand';
import { UserBehaviorAggregate } from '../../domain/aggregates/UserBehaviorAggregate';
import { IStorage } from '../../storage';

export interface ITrackUserInteractionCommandHandler {
  handle(command: TrackUserInteractionCommand): Promise<{
    success: boolean;
    message: string;
    interactionId?: number;
    behaviorInsights?: any[];
  }>;
}

/**
 * Core Command Handler for User Interaction Tracking
 * Apple-style intelligent user behavior learning
 */
export class TrackUserInteractionCommandHandler implements ITrackUserInteractionCommandHandler {
  
  constructor(private readonly storage: IStorage) {}

  /**
   * Handle user interaction tracking command
   * Implements sophisticated behavioral learning
   */
  async handle(command: TrackUserInteractionCommand): Promise<{
    success: boolean;
    message: string;
    interactionId?: number;
    behaviorInsights?: any[];
  }> {
    try {
      // Validate command
      const validation = command.validate();
      if (!validation.isValid) {
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Store the interaction
      const interaction = await this.storage.createUserInteraction({
        userId: command.interactionData.userId,
        modelId: command.interactionData.modelId,
        interactionType: command.interactionData.interactionType,
        engagementLevel: command.interactionData.engagementLevel,
        sessionDuration: command.interactionData.sessionDuration,
        deviceType: command.interactionData.deviceType,
        referralSource: command.interactionData.referralSource
      });

      // Calculate affinity boost
      const affinityBoost = this.calculateAffinityBoost(
        command.interactionData.interactionType,
        command.interactionData.engagementLevel
      );

      // Update user behavior profiles asynchronously
      this.updateUserBehaviorAsync(command.interactionData, affinityBoost);

      return {
        success: true,
        message: 'Interaction tracked successfully',
        interactionId: interaction.id,
        behaviorInsights: []
      };

    } catch (error) {
      console.error('Error tracking user interaction:', error);
      return {
        success: false,
        message: 'Failed to track interaction'
      };
    }
  }

  /**
   * Calculate affinity boost based on interaction type and engagement
   * Apple-style intelligent scoring
   */
  private calculateAffinityBoost(interactionType: string, engagementLevel: number): number {
    const baseScores = {
      'view': 1,
      'like': 3,
      'bookmark': 4,
      'generate': 5,
      'share': 4,
      'download': 4
    };

    const baseScore = baseScores[interactionType as keyof typeof baseScores] || 1;
    const engagementMultiplier = engagementLevel / 5; // Normalize to 0-2 range
    
    return Math.round(baseScore * engagementMultiplier);
  }

  /**
   * Update user behavior profiles asynchronously
   * Apple-style background learning
   */
  private async updateUserBehaviorAsync(
    interactionData: any,
    affinityBoost: number
  ): Promise<void> {
    try {
      // Get or create user behavior profile
      await this.ensureUserBehaviorProfile(interactionData.userId);

      // Update category affinity
      await this.updateCategoryAffinity(
        interactionData.userId,
        'General', // Default category for now
        affinityBoost
      );

      // Update provider affinity
      await this.updateProviderAffinity(
        interactionData.userId,
        'RunDiffusion', // Default provider for now
        affinityBoost
      );

    } catch (error) {
      console.error('Error updating behavior profile:', error);
      // Don't throw - this is background processing
    }
  }

  /**
   * Ensure user behavior profile exists
   */
  private async ensureUserBehaviorProfile(userId: number): Promise<void> {
    try {
      // Try to get existing profile
      const existingProfile = await this.storage.getUserBehaviorProfile?.(userId);
      
      if (!existingProfile) {
        // Create new profile with defaults
        await this.storage.createUserBehaviorProfile?.({
          userId,
          preferredCategories: [],
          preferredProviders: [],
          preferredStyles: [],
          qualityThreshold: 70,
          speedPreference: 'balanced',
          complexityLevel: 'intermediate',
          explorationScore: 60,
          averageSessionDuration: 600,
          mostActiveTimeOfDay: 14,
          totalInteractions: 0
        });
      }
    } catch (error) {
      console.error('Error ensuring user behavior profile:', error);
    }
  }

  /**
   * Update category affinity score
   */
  private async updateCategoryAffinity(
    userId: number,
    category: string,
    boost: number
  ): Promise<void> {
    try {
      await this.storage.updateOrCreateCategoryAffinity?.(userId, category, boost);
    } catch (error) {
      console.error('Error updating category affinity:', error);
    }
  }

  /**
   * Update provider affinity score
   */
  private async updateProviderAffinity(
    userId: number,
    provider: string,
    boost: number
  ): Promise<void> {
    try {
      await this.storage.updateOrCreateProviderAffinity?.(userId, provider, boost);
    } catch (error) {
      console.error('Error updating provider affinity:', error);
    }
  }
}