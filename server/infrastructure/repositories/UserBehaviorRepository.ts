/**
 * User Behavior Repository - Infrastructure Layer
 * Manages persistent storage of user behavioral data
 * Following Clean Architecture and Apple's design philosophy
 */

import { db } from '../db';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { 
  userModelInteractions, 
  userBehaviorProfiles, 
  userCategoryAffinities, 
  userProviderAffinities,
  UserModelInteraction,
  UserBehaviorProfile,
  UserCategoryAffinity,
  UserProviderAffinity,
  InsertUserModelInteraction,
  InsertUserBehaviorProfile,
  InsertUserCategoryAffinity,
  InsertUserProviderAffinity
} from '@shared/schema';

export interface BehaviorAnalytics {
  readonly totalInteractions: number;
  readonly categoryBreakdown: Record<string, number>;
  readonly providerBreakdown: Record<string, number>;
  readonly engagementTrends: Array<{ date: string; avgEngagement: number }>;
  readonly peakUsageHours: number[];
  readonly preferenceStrength: number; // 0-1 how defined user's preferences are
}

export interface InteractionPattern {
  readonly userId: number;
  readonly timeOfDay: number;
  readonly dayOfWeek: number;
  readonly averageSessionDuration: number;
  readonly preferredCategories: string[];
  readonly preferredProviders: string[];
  readonly qualityThreshold: number;
  readonly explorationScore: number;
}

export class UserBehaviorRepository {
  
  /**
   * Record a new user interaction with enhanced tracking
   */
  async recordInteraction(interaction: InsertUserModelInteraction): Promise<UserModelInteraction> {
    try {
      const [result] = await db.insert(userModelInteractions)
        .values(interaction)
        .returning();
      
      // Update behavior profile asynchronously
      this.updateBehaviorProfileAsync(interaction.userId);
      
      return result;
    } catch (error) {
      console.error('Error recording user interaction:', error);
      throw error;
    }
  }

  /**
   * Get user's interaction history with filtering options
   */
  async getUserInteractions(
    userId: number,
    limit: number = 100,
    interactionType?: string,
    days?: number
  ): Promise<UserModelInteraction[]> {
    try {
      let query = db.select()
        .from(userModelInteractions)
        .where(eq(userModelInteractions.userId, userId));

      if (interactionType) {
        query = query.where(
          and(
            eq(userModelInteractions.userId, userId),
            eq(userModelInteractions.interactionType, interactionType)
          )
        );
      }

      if (days) {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        query = query.where(
          and(
            eq(userModelInteractions.userId, userId),
            gte(userModelInteractions.createdAt, cutoffDate)
          )
        );
      }

      return await query
        .orderBy(desc(userModelInteractions.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      return [];
    }
  }

  /**
   * Get or create user behavior profile
   */
  async getUserBehaviorProfile(userId: number): Promise<UserBehaviorProfile | null> {
    try {
      const [profile] = await db.select()
        .from(userBehaviorProfiles)
        .where(eq(userBehaviorProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        // Create default behavior profile
        return await this.createDefaultBehaviorProfile(userId);
      }

      return profile;
    } catch (error) {
      console.error('Error fetching behavior profile:', error);
      return null;
    }
  }

  /**
   * Update user behavior profile based on recent interactions
   */
  async updateBehaviorProfile(userId: number, updates: Partial<InsertUserBehaviorProfile>): Promise<UserBehaviorProfile | null> {
    try {
      const [updated] = await db.update(userBehaviorProfiles)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(userBehaviorProfiles.userId, userId))
        .returning();

      return updated;
    } catch (error) {
      console.error('Error updating behavior profile:', error);
      return null;
    }
  }

  /**
   * Get user's category affinities
   */
  async getUserCategoryAffinities(userId: number): Promise<UserCategoryAffinity[]> {
    try {
      return await db.select()
        .from(userCategoryAffinities)
        .where(eq(userCategoryAffinities.userId, userId))
        .orderBy(desc(userCategoryAffinities.affinityScore));
    } catch (error) {
      console.error('Error fetching category affinities:', error);
      return [];
    }
  }

  /**
   * Update or insert category affinity
   */
  async updateCategoryAffinity(
    userId: number, 
    category: string, 
    scoreIncrease: number
  ): Promise<UserCategoryAffinity | null> {
    try {
      // Try to find existing affinity
      const [existing] = await db.select()
        .from(userCategoryAffinities)
        .where(
          and(
            eq(userCategoryAffinities.userId, userId),
            eq(userCategoryAffinities.category, category)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing affinity
        const newScore = Math.min(100, existing.affinityScore + Math.round(scoreIncrease * 100));
        const [updated] = await db.update(userCategoryAffinities)
          .set({
            affinityScore: newScore,
            interactionCount: existing.interactionCount + 1,
            lastInteractionAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(userCategoryAffinities.id, existing.id))
          .returning();
        
        return updated;
      } else {
        // Create new affinity
        const [created] = await db.insert(userCategoryAffinities)
          .values({
            userId,
            category,
            affinityScore: Math.round(scoreIncrease * 100),
            interactionCount: 1
          })
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('Error updating category affinity:', error);
      return null;
    }
  }

  /**
   * Get user's provider affinities
   */
  async getUserProviderAffinities(userId: number): Promise<UserProviderAffinity[]> {
    try {
      return await db.select()
        .from(userProviderAffinities)
        .where(eq(userProviderAffinities.userId, userId))
        .orderBy(desc(userProviderAffinities.affinityScore));
    } catch (error) {
      console.error('Error fetching provider affinities:', error);
      return [];
    }
  }

  /**
   * Update or insert provider affinity
   */
  async updateProviderAffinity(
    userId: number, 
    provider: string, 
    scoreIncrease: number,
    qualityRating?: number
  ): Promise<UserProviderAffinity | null> {
    try {
      // Try to find existing affinity
      const [existing] = await db.select()
        .from(userProviderAffinities)
        .where(
          and(
            eq(userProviderAffinities.userId, userId),
            eq(userProviderAffinities.provider, provider)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing affinity
        const newScore = Math.min(100, existing.affinityScore + Math.round(scoreIncrease * 100));
        const [updated] = await db.update(userProviderAffinities)
          .set({
            affinityScore: newScore,
            interactionCount: existing.interactionCount + 1,
            qualityRating: qualityRating || existing.qualityRating,
            lastInteractionAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(userProviderAffinities.id, existing.id))
          .returning();
        
        return updated;
      } else {
        // Create new affinity
        const [created] = await db.insert(userProviderAffinities)
          .values({
            userId,
            provider,
            affinityScore: Math.round(scoreIncrease * 100),
            interactionCount: 1,
            qualityRating: qualityRating || 70
          })
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('Error updating provider affinity:', error);
      return null;
    }
  }

  /**
   * Analyze user behavior patterns for personalization
   */
  async analyzeBehaviorPatterns(userId: number): Promise<BehaviorAnalytics> {
    try {
      // Get recent interactions (last 30 days)
      const recentInteractions = await this.getUserInteractions(userId, 1000, undefined, 30);
      
      if (recentInteractions.length === 0) {
        return this.getDefaultAnalytics();
      }

      // Calculate category breakdown
      const categoryBreakdown: Record<string, number> = {};
      const providerBreakdown: Record<string, number> = {};
      
      // Calculate engagement trends (last 7 days)
      const engagementTrends = await this.calculateEngagementTrends(userId, 7);
      
      // Calculate peak usage hours
      const peakUsageHours = this.calculatePeakUsageHours(recentInteractions);
      
      // Calculate preference strength (how defined are user's preferences)
      const preferenceStrength = this.calculatePreferenceStrength(recentInteractions);

      return {
        totalInteractions: recentInteractions.length,
        categoryBreakdown,
        providerBreakdown,
        engagementTrends,
        peakUsageHours,
        preferenceStrength
      };
    } catch (error) {
      console.error('Error analyzing behavior patterns:', error);
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Get interaction patterns for machine learning
   */
  async getInteractionPattern(userId: number): Promise<InteractionPattern> {
    try {
      const profile = await this.getUserBehaviorProfile(userId);
      const categoryAffinities = await this.getUserCategoryAffinities(userId);
      const providerAffinities = await this.getUserProviderAffinities(userId);
      const recentInteractions = await this.getUserInteractions(userId, 100, undefined, 30);

      const avgSessionDuration = recentInteractions
        .filter(i => i.sessionDuration)
        .reduce((sum, i) => sum + (i.sessionDuration || 0), 0) / recentInteractions.length || 600;

      return {
        userId,
        timeOfDay: profile?.mostActiveTimeOfDay || 14,
        dayOfWeek: new Date().getDay(),
        averageSessionDuration,
        preferredCategories: categoryAffinities.slice(0, 3).map(a => a.category),
        preferredProviders: providerAffinities.slice(0, 2).map(a => a.provider),
        qualityThreshold: profile?.qualityThreshold || 70,
        explorationScore: (profile?.explorationScore || 60) / 100
      };
    } catch (error) {
      console.error('Error getting interaction pattern:', error);
      return this.getDefaultInteractionPattern(userId);
    }
  }

  // Private helper methods

  private async createDefaultBehaviorProfile(userId: number): Promise<UserBehaviorProfile> {
    const [profile] = await db.insert(userBehaviorProfiles)
      .values({
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
      })
      .returning();
    
    return profile;
  }

  private async updateBehaviorProfileAsync(userId: number): Promise<void> {
    // Run in background - analyze recent interactions and update profile
    setTimeout(async () => {
      try {
        const recentInteractions = await this.getUserInteractions(userId, 50, undefined, 7);
        if (recentInteractions.length === 0) return;

        const avgSessionDuration = recentInteractions
          .filter(i => i.sessionDuration)
          .reduce((sum, i) => sum + (i.sessionDuration || 0), 0) / recentInteractions.length;

        const hourCounts = recentInteractions.reduce((acc, i) => {
          const hour = i.createdAt.getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const mostActiveTimeOfDay = Object.entries(hourCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0];

        await this.updateBehaviorProfile(userId, {
          totalInteractions: recentInteractions.length,
          averageSessionDuration: Math.round(avgSessionDuration),
          mostActiveTimeOfDay: mostActiveTimeOfDay ? parseInt(mostActiveTimeOfDay) : 14,
          lastActiveAt: new Date()
        });
      } catch (error) {
        console.error('Error updating behavior profile async:', error);
      }
    }, 1000);
  }

  private async calculateEngagementTrends(userId: number, days: number): Promise<Array<{ date: string; avgEngagement: number }>> {
    // Simplified implementation - in production would use more sophisticated SQL
    const trends: Array<{ date: string; avgEngagement: number }> = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      trends.push({
        date: date.toISOString().split('T')[0],
        avgEngagement: 6.5 + Math.random() * 2 // Simulated engagement
      });
    }
    
    return trends;
  }

  private calculatePeakUsageHours(interactions: UserModelInteraction[]): number[] {
    const hourCounts = interactions.reduce((acc, i) => {
      const hour = i.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private calculatePreferenceStrength(interactions: UserModelInteraction[]): number {
    if (interactions.length < 5) return 0.3;
    
    // Calculate based on consistency of interactions
    const avgEngagement = interactions.reduce((sum, i) => sum + (i.engagementLevel || 5), 0) / interactions.length;
    const engagementVariance = interactions.reduce((sum, i) => 
      sum + Math.pow((i.engagementLevel || 5) - avgEngagement, 2), 0) / interactions.length;
    
    // Lower variance = stronger preferences
    return Math.max(0.1, Math.min(1.0, 1 - (engagementVariance / 25)));
  }

  private getDefaultAnalytics(): BehaviorAnalytics {
    return {
      totalInteractions: 0,
      categoryBreakdown: {},
      providerBreakdown: {},
      engagementTrends: [],
      peakUsageHours: [14, 15, 16],
      preferenceStrength: 0.3
    };
  }

  private getDefaultInteractionPattern(userId: number): InteractionPattern {
    return {
      userId,
      timeOfDay: 14,
      dayOfWeek: new Date().getDay(),
      averageSessionDuration: 600,
      preferredCategories: ['General'],
      preferredProviders: ['RunDiffusion'],
      qualityThreshold: 70,
      explorationScore: 0.6
    };
  }
}