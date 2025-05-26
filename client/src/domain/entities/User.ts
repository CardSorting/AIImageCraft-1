/**
 * User Domain Entity
 * Following Apple's philosophy of user-centricity and privacy
 * Encapsulates user behavior, preferences, and state
 */

export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly notificationsEnabled: boolean;
  readonly autoSaveEnabled: boolean;
  readonly preferredImageQuality: 'high' | 'medium' | 'low';
  readonly defaultModelCategory: string;
}

export interface UserSubscription {
  readonly tier: 'free' | 'premium' | 'enterprise';
  readonly expiresAt?: Date;
  readonly creditsIncluded: number;
  readonly featuresEnabled: string[];
}

export interface UserActivity {
  readonly lastLoginAt: Date;
  readonly totalImagesGenerated: number;
  readonly totalCreditsSpent: number;
  readonly favoriteModels: number[];
  readonly recentSearches: string[];
}

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly name: string,
    public readonly avatar: string | null,
    public readonly preferences: UserPreferences,
    public readonly subscription: UserSubscription,
    public readonly activity: UserActivity,
    private _creditBalance: number
  ) {}

  get creditBalance(): number {
    return this._creditBalance;
  }

  get displayName(): string {
    return this.name || this.email.split('@')[0];
  }

  get isPremiumUser(): boolean {
    return this.subscription.tier !== 'free';
  }

  get canGenerateImage(): boolean {
    return this._creditBalance > 0;
  }

  get hasRecentActivity(): boolean {
    const daysSinceLastLogin = Math.floor(
      (Date.now() - this.activity.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastLogin <= 7;
  }

  get engagementLevel(): 'high' | 'medium' | 'low' {
    if (this.activity.totalImagesGenerated > 100) return 'high';
    if (this.activity.totalImagesGenerated > 20) return 'medium';
    return 'low';
  }

  canAffordGeneration(cost: number): boolean {
    return this._creditBalance >= cost;
  }

  deductCredits(amount: number): User {
    if (amount > this._creditBalance) {
      throw new Error('Insufficient credits');
    }

    return new User(
      this.id,
      this.email,
      this.name,
      this.avatar,
      this.preferences,
      this.subscription,
      this.activity,
      this._creditBalance - amount
    );
  }

  addCredits(amount: number): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.avatar,
      this.preferences,
      this.subscription,
      this.activity,
      this._creditBalance + amount
    );
  }

  updatePreferences(newPreferences: Partial<UserPreferences>): User {
    const updatedPreferences = { ...this.preferences, ...newPreferences };
    return new User(
      this.id,
      this.email,
      this.name,
      this.avatar,
      updatedPreferences,
      this.subscription,
      this.activity,
      this._creditBalance
    );
  }
}