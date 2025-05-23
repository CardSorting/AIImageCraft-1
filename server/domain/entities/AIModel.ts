/**
 * AI Model Domain Entity - Clean Architecture
 * Following Apple's philosophy of intelligent, capability-driven design
 */

export interface ModelCapabilities {
  readonly supportedStyles: string[];
  readonly maxResolution: string;
  readonly speedTier: 'ultra_fast' | 'fast' | 'standard' | 'detailed';
  readonly qualityTier: 'standard' | 'premium' | 'professional';
  readonly specialFeatures: string[];
}

export interface ModelMetrics {
  readonly popularityScore: number;
  readonly qualityRating: number;
  readonly userSatisfaction: number;
  readonly performanceIndex: number;
}

export interface ModelPricing {
  readonly tier: 'free' | 'pro' | 'enterprise';
  readonly creditsPerGeneration: number;
  readonly costPerImage: number;
  readonly bulkDiscounts?: { threshold: number; discount: number }[];
}

/**
 * Core AI Model Entity
 * Encapsulates model behavior with rich domain logic
 */
export class AIModelEntity {
  constructor(
    public readonly id: number,
    public readonly modelId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: string,
    public readonly provider: string,
    public readonly capabilities: ModelCapabilities,
    public readonly metrics: ModelMetrics,
    public readonly pricing: ModelPricing,
    public readonly tags: string[] = [],
    public readonly featured: boolean = false,
    public readonly createdAt: Date = new Date()
  ) {}

  /**
   * Calculate model's overall appeal score
   * Apple-style intelligent ranking
   */
  calculateAppealScore(): number {
    const popularityWeight = this.metrics.popularityScore * 0.3;
    const qualityWeight = this.metrics.qualityRating * 0.4;
    const satisfactionWeight = this.metrics.userSatisfaction * 0.2;
    const performanceWeight = this.metrics.performanceIndex * 0.1;
    
    return Math.round(popularityWeight + qualityWeight + satisfactionWeight + performanceWeight);
  }

  /**
   * Determine if model matches user preferences
   */
  matchesUserProfile(userPreferences: {
    preferredCategories: string[];
    preferredProviders: string[];
    qualityThreshold: number;
    speedPreference: string;
  }): {
    compatibility: number;
    reasons: string[];
    recommendations: string[];
  } {
    let compatibility = 0;
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // Category matching
    if (userPreferences.preferredCategories.includes(this.category)) {
      compatibility += 30;
      reasons.push(`Matches your ${this.category} preference`);
    }

    // Provider matching
    if (userPreferences.preferredProviders.includes(this.provider)) {
      compatibility += 20;
      reasons.push(`From your preferred provider ${this.provider}`);
    }

    // Quality threshold
    if (this.metrics.qualityRating >= userPreferences.qualityThreshold) {
      compatibility += 25;
      reasons.push(`Meets your quality standards (${this.metrics.qualityRating}/100)`);
    }

    // Speed preference alignment
    const speedMatch = this.getSpeedCompatibility(userPreferences.speedPreference);
    compatibility += speedMatch.score;
    if (speedMatch.reason) reasons.push(speedMatch.reason);

    // Generate recommendations
    if (compatibility < 50) {
      if (this.metrics.qualityRating > userPreferences.qualityThreshold + 10) {
        recommendations.push('This model offers higher quality than your usual preference');
      }
      if (!userPreferences.preferredCategories.includes(this.category)) {
        recommendations.push(`Explore ${this.category} style for creative variety`);
      }
    }

    return {
      compatibility: Math.min(100, compatibility),
      reasons,
      recommendations
    };
  }

  /**
   * Get speed compatibility score
   */
  private getSpeedCompatibility(speedPreference: string): { score: number; reason?: string } {
    const speedMap = {
      'fast': { ultra_fast: 25, fast: 20, standard: 10, detailed: 5 },
      'balanced': { ultra_fast: 15, fast: 25, standard: 20, detailed: 15 },
      'quality': { ultra_fast: 5, fast: 10, standard: 20, detailed: 25 }
    };

    const score = speedMap[speedPreference as keyof typeof speedMap]?.[this.capabilities.speedTier] || 0;
    const reason = score > 15 ? `Optimized for ${speedPreference} generation` : undefined;

    return { score, reason };
  }

  /**
   * Check if model is suitable for exploration
   */
  isGoodForExploration(userExperienceLevel: string): boolean {
    const experienceLevels = {
      'novice': this.category === 'General' && this.metrics.qualityRating > 70,
      'intermediate': this.metrics.qualityRating > 60 && this.capabilities.specialFeatures.length <= 3,
      'expert': this.metrics.qualityRating > 50,
      'power_user': true
    };

    return experienceLevels[userExperienceLevel as keyof typeof experienceLevels] || false;
  }

  /**
   * Get model's primary value proposition
   */
  getValueProposition(): {
    primaryBenefit: string;
    secondaryBenefits: string[];
    bestUseCase: string;
  } {
    const tierBenefits = {
      'ultra_fast': 'Lightning-fast generation for rapid iteration',
      'fast': 'Quick results without compromising quality',
      'standard': 'Balanced performance for most creative needs',
      'detailed': 'Maximum quality for professional work'
    };

    const categoryUseCases = {
      'Photorealistic': 'Professional photography and realistic portraits',
      'Artistic': 'Creative artwork and stylized illustrations',
      'General': 'Versatile content creation across all styles',
      'Speed': 'Rapid prototyping and quick iterations',
      'Latest': 'Cutting-edge features and experimental styles'
    };

    return {
      primaryBenefit: tierBenefits[this.capabilities.speedTier],
      secondaryBenefits: this.capabilities.specialFeatures.slice(0, 3),
      bestUseCase: categoryUseCases[this.category as keyof typeof categoryUseCases] || 'General creative work'
    };
  }
}