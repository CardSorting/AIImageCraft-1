/**
 * Card Rarity Value Object
 * Implements Y2K trading card game aesthetics with unique star-letter combinations
 * Following Apple's philosophy of delightful user experiences
 */

export interface RarityTier {
  readonly name: string;
  readonly stars: number;
  readonly letter: string;
  readonly probability: number;
  readonly colors: {
    readonly primary: string;
    readonly secondary: string;
    readonly accent: string;
    readonly glow: string;
  };
  readonly effects: {
    readonly holographic: boolean;
    readonly shimmer: boolean;
    readonly pulse: boolean;
    readonly sparkles: boolean;
  };
}

export const RARITY_TIERS: Record<string, RarityTier> = {
  COMMON: {
    name: 'Common',
    stars: 1,
    letter: 'C',
    probability: 0.50, // 50%
    colors: {
      primary: '#6B7280', // Gray
      secondary: '#9CA3AF',
      accent: '#D1D5DB',
      glow: 'rgba(107, 114, 128, 0.3)'
    },
    effects: {
      holographic: false,
      shimmer: false,
      pulse: false,
      sparkles: false
    }
  },
  UNCOMMON: {
    name: 'Uncommon',
    stars: 2,
    letter: 'U',
    probability: 0.30, // 30%
    colors: {
      primary: '#10B981', // Emerald
      secondary: '#34D399',
      accent: '#6EE7B7',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    effects: {
      holographic: false,
      shimmer: true,
      pulse: false,
      sparkles: false
    }
  },
  RARE: {
    name: 'Rare',
    stars: 3,
    letter: 'R',
    probability: 0.15, // 15%
    colors: {
      primary: '#3B82F6', // Blue
      secondary: '#60A5FA',
      accent: '#93C5FD',
      glow: 'rgba(59, 130, 246, 0.5)'
    },
    effects: {
      holographic: false,
      shimmer: true,
      pulse: true,
      sparkles: false
    }
  },
  EPIC: {
    name: 'Epic',
    stars: 4,
    letter: 'E',
    probability: 0.04, // 4%
    colors: {
      primary: '#8B5CF6', // Purple
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      glow: 'rgba(139, 92, 246, 0.6)'
    },
    effects: {
      holographic: true,
      shimmer: true,
      pulse: true,
      sparkles: true
    }
  },
  LEGENDARY: {
    name: 'Legendary',
    stars: 5,
    letter: 'L',
    probability: 0.009, // 0.9%
    colors: {
      primary: '#F59E0B', // Amber/Gold
      secondary: '#FCD34D',
      accent: '#FDE68A',
      glow: 'rgba(245, 158, 11, 0.7)'
    },
    effects: {
      holographic: true,
      shimmer: true,
      pulse: true,
      sparkles: true
    }
  },
  MYTHIC: {
    name: 'Mythic',
    stars: 6,
    letter: 'M',
    probability: 0.001, // 0.1%
    colors: {
      primary: '#EF4444', // Red/Ruby
      secondary: '#F87171',
      accent: '#FCA5A5',
      glow: 'rgba(239, 68, 68, 0.8)'
    },
    effects: {
      holographic: true,
      shimmer: true,
      pulse: true,
      sparkles: true
    }
  }
};

export class CardRarity {
  private constructor(
    public readonly tier: RarityTier,
    public readonly score: number
  ) {}

  static generate(): CardRarity {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const [key, tier] of Object.entries(RARITY_TIERS)) {
      cumulativeProbability += tier.probability;
      if (random <= cumulativeProbability) {
        // Generate a score within the tier range
        const baseScore = this.getBaseScore(key);
        const variance = Math.random() * 10 - 5; // ±5 variance
        const score = Math.max(0, Math.min(100, baseScore + variance));
        
        return new CardRarity(tier, Math.round(score * 10) / 10);
      }
    }

    // Fallback to common (should never reach here)
    return new CardRarity(RARITY_TIERS.COMMON, 50);
  }

  private static getBaseScore(tierKey: string): number {
    const scoreRanges: Record<string, number> = {
      COMMON: 25,
      UNCOMMON: 45,
      RARE: 65,
      EPIC: 80,
      LEGENDARY: 92,
      MYTHIC: 98
    };
    return scoreRanges[tierKey] || 50;
  }

  get displayName(): string {
    return `${this.tier.letter}${this.tier.stars}★`;
  }

  get isSpecial(): boolean {
    return this.tier.stars >= 4;
  }

  get hasAnimations(): boolean {
    return this.tier.effects.holographic || this.tier.effects.sparkles;
  }
}