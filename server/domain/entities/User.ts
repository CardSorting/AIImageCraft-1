/**
 * User Domain Entity - Clean Architecture
 * Following Apple's philosophy of elegant, user-centric design
 */

export interface UserPreferences {
  readonly preferredCategories: string[];
  readonly preferredProviders: string[];
  readonly preferredStyles: string[];
  readonly qualityThreshold: number;
  readonly speedPreference: 'fast' | 'balanced' | 'quality';
  readonly complexityLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserBehaviorMetrics {
  readonly explorationScore: number;
  readonly averageSessionDuration: number;
  readonly mostActiveTimeOfDay: number;
  readonly totalInteractions: number;
}

export interface UserEngagementScores {
  readonly categoryAffinities: Map<string, number>;
  readonly providerAffinities: Map<string, number>;
  readonly qualityAppreciation: number;
  readonly diversityIndex: number;
}

/**
 * Core User Profile Entity
 * Encapsulates user behavior and preferences with rich domain logic
 */
export class UserProfile {
  constructor(
    public readonly id: number,
    public readonly preferences: UserPreferences,
    public readonly behaviorMetrics: UserBehaviorMetrics,
    public readonly engagementScores: UserEngagementScores,
    public readonly lastActiveAt: Date = new Date()
  ) {}

  /**
   * Calculate user's overall engagement level
   * Apple-style intelligent scoring
   */
  calculateEngagementLevel(): number {
    const sessionWeight = Math.min(this.behaviorMetrics.averageSessionDuration / 600, 1); // Normalize to 10min
    const explorationWeight = this.behaviorMetrics.explorationScore / 100;
    const interactionWeight = Math.min(this.behaviorMetrics.totalInteractions / 100, 1);
    
    return Math.round((sessionWeight + explorationWeight + interactionWeight) * 100 / 3);
  }

  /**
   * Determine user's expertise level based on behavior
   */
  getExpertiseLevel(): 'novice' | 'intermediate' | 'expert' | 'power_user' {
    const interactions = this.behaviorMetrics.totalInteractions;
    const diversity = this.engagementScores.diversityIndex;
    
    if (interactions < 10) return 'novice';
    if (interactions < 50 || diversity < 0.3) return 'intermediate';
    if (interactions < 200 || diversity < 0.6) return 'expert';
    return 'power_user';
  }

  /**
   * Get personalized recommendation context
   */
  getRecommendationContext(): {
    primaryInterests: string[];
    qualityExpectation: 'high' | 'medium' | 'flexible';
    explorationWillingness: 'conservative' | 'moderate' | 'adventurous';
    timeConstraints: 'quick' | 'standard' | 'detailed';
  } {
    const topCategories = Array.from(this.engagementScores.categoryAffinities.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      primaryInterests: topCategories,
      qualityExpectation: this.preferences.qualityThreshold > 80 ? 'high' : 
                         this.preferences.qualityThreshold > 60 ? 'medium' : 'flexible',
      explorationWillingness: this.behaviorMetrics.explorationScore > 70 ? 'adventurous' :
                             this.behaviorMetrics.explorationScore > 40 ? 'moderate' : 'conservative',
      timeConstraints: this.preferences.speedPreference === 'fast' ? 'quick' :
                      this.preferences.speedPreference === 'quality' ? 'detailed' : 'standard'
    };
  }
}