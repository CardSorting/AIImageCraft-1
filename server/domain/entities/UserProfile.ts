/**
 * User Profile Entity - Core Domain Entity
 * Represents user preferences and behavior patterns
 * Following Apple's philosophy of user-centric design
 */

export interface UserPreferences {
  readonly preferredCategories: string[];
  readonly preferredProviders: string[];
  readonly preferredStyles: string[];
  readonly qualityThreshold: number; // 0-100
  readonly speedPreference: 'fast' | 'balanced' | 'quality';
  readonly complexityLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserBehaviorMetrics {
  readonly totalInteractions: number;
  readonly averageSessionDuration: number;
  readonly mostActiveTimeOfDay: number; // 0-23 hours
  readonly favoriteFeatures: string[];
  readonly searchPatterns: string[];
  readonly generationFrequency: number; // per week
}

export interface UserEngagementScores {
  readonly categoryAffinities: Map<string, number>; // 0-1 scores
  readonly providerAffinities: Map<string, number>;
  readonly featureUsageScores: Map<string, number>;
  readonly qualityPreferenceScore: number;
  readonly explorationScore: number; // How willing to try new things
}

export class UserProfile {
  constructor(
    public readonly userId: number,
    public readonly preferences: UserPreferences,
    public readonly behaviorMetrics: UserBehaviorMetrics,
    public readonly engagementScores: UserEngagementScores,
    public readonly lastUpdated: Date = new Date()
  ) {}

  /**
   * Calculate user's preference strength for a category
   * Apple-inspired intuitive scoring system
   */
  getCategoryAffinity(category: string): number {
    const baseScore = this.engagementScores.categoryAffinities.get(category) || 0;
    const preferenceBoost = this.preferences.preferredCategories.includes(category) ? 0.2 : 0;
    const experienceBoost = this.getExperienceBoost();
    
    return Math.min(1, baseScore + preferenceBoost + experienceBoost);
  }

  /**
   * Get user's exploration willingness
   * Balances familiar content with discovery
   */
  getExplorationWillingness(): number {
    return this.engagementScores.explorationScore;
  }

  /**
   * Calculate quality preference alignment with model
   */
  getQualityAlignment(modelRating: number): number {
    const userThreshold = this.preferences.qualityThreshold;
    const difference = Math.abs(modelRating - userThreshold);
    return Math.max(0, 1 - (difference / 50)); // Normalize to 0-1
  }

  private getExperienceBoost(): number {
    // More experienced users get slight boost for advanced models
    const experienceMap = { beginner: 0, intermediate: 0.05, advanced: 0.1 };
    return experienceMap[this.preferences.complexityLevel];
  }

  /**
   * Check if user prefers this provider
   */
  hasProviderAffinity(provider: string): boolean {
    return this.preferences.preferredProviders.includes(provider) ||
           (this.engagementScores.providerAffinities.get(provider) || 0) > 0.6;
  }

  /**
   * Get time-based recommendation boost
   * Apple-style contextual awareness
   */
  getTimeContextBoost(): number {
    const currentHour = new Date().getHours();
    const preferredHour = this.behaviorMetrics.mostActiveTimeOfDay;
    const timeDifference = Math.abs(currentHour - preferredHour);
    
    // Higher score when user is typically most active
    return Math.max(0, 1 - (timeDifference / 12));
  }
}

/**
 * Domain Events for User Profile changes
 */
export abstract class UserProfileEvent {
  constructor(
    public readonly userId: number,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class UserPreferencesUpdated extends UserProfileEvent {
  constructor(
    userId: number,
    public readonly newPreferences: UserPreferences,
    public readonly previousPreferences: UserPreferences
  ) {
    super(userId);
  }
}

export class UserBehaviorRecorded extends UserProfileEvent {
  constructor(
    userId: number,
    public readonly interactionType: string,
    public readonly modelId: number,
    public readonly engagementDuration: number
  ) {
    super(userId);
  }
}

export class UserEngagementScoreUpdated extends UserProfileEvent {
  constructor(
    userId: number,
    public readonly scoreType: string,
    public readonly newScore: number,
    public readonly previousScore: number
  ) {
    super(userId);
  }
}