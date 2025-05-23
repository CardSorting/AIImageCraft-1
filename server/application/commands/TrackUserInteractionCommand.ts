/**
 * Track User Interaction Command - CQRS Pattern
 * Following Apple's philosophy of seamless user experience tracking
 * Implements Clean Architecture command handling
 */

export interface UserInteractionData {
  readonly userId: number;
  readonly modelId: number;
  readonly interactionType: 'view' | 'like' | 'bookmark' | 'generate' | 'share' | 'download';
  readonly engagementLevel: number; // 1-10
  readonly sessionDuration?: number; // seconds
  readonly deviceType?: 'mobile' | 'tablet' | 'desktop';
  readonly referralSource?: 'search' | 'recommendation' | 'direct' | 'featured';
  readonly timestamp: Date;
}

export class TrackUserInteractionCommand {
  constructor(
    public readonly interactionData: UserInteractionData
  ) {}

  /**
   * Validate command data
   * Apple-style input validation
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.interactionData.userId || this.interactionData.userId <= 0) {
      errors.push('Valid user ID is required');
    }

    if (!this.interactionData.modelId || this.interactionData.modelId <= 0) {
      errors.push('Valid model ID is required');
    }

    if (!['view', 'like', 'bookmark', 'generate', 'share', 'download'].includes(this.interactionData.interactionType)) {
      errors.push('Valid interaction type is required');
    }

    if (this.interactionData.engagementLevel < 1 || this.interactionData.engagementLevel > 10) {
      errors.push('Engagement level must be between 1 and 10');
    }

    if (this.interactionData.sessionDuration && this.interactionData.sessionDuration < 0) {
      errors.push('Session duration cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate engagement level based on interaction type and context
   */
  static calculateEngagementLevel(
    interactionType: string,
    sessionDuration?: number,
    deviceType?: string
  ): number {
    const baseScores = {
      'view': 3,
      'like': 6,
      'bookmark': 7,
      'generate': 9,
      'share': 8,
      'download': 8
    };

    let score = baseScores[interactionType as keyof typeof baseScores] || 3;

    // Session duration bonus
    if (sessionDuration) {
      if (sessionDuration > 300) score += 2; // 5+ minutes
      else if (sessionDuration > 60) score += 1; // 1+ minutes
    }

    // Device type adjustment
    if (deviceType === 'mobile' && interactionType === 'generate') {
      score += 1; // Mobile generation shows higher intent
    }

    return Math.min(10, score);
  }
}