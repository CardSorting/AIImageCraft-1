/**
 * Model Commands - CQRS Command Pattern
 * Following Apple's philosophy of clear, intentional actions
 * Each command represents a specific user intent
 */

export interface Command<TResult = void> {
  readonly type: string;
  execute(): Promise<TResult>;
}

export interface BookmarkModelCommand extends Command<boolean> {
  readonly type: 'BOOKMARK_MODEL';
  readonly userId: number;
  readonly modelId: number;
  readonly isBookmarked: boolean;
}

export interface LikeModelCommand extends Command<boolean> {
  readonly type: 'LIKE_MODEL';
  readonly userId: number;
  readonly modelId: number;
  readonly isLiked: boolean;
}

export interface TrackModelInteractionCommand extends Command<void> {
  readonly type: 'TRACK_MODEL_INTERACTION';
  readonly userId: number;
  readonly modelId: number;
  readonly interactionType: 'view' | 'click' | 'bookmark' | 'like' | 'share';
  readonly engagementLevel: number;
  readonly sessionDuration?: number;
  readonly deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface SearchModelsCommand extends Command<void> {
  readonly type: 'SEARCH_MODELS';
  readonly userId: number;
  readonly query: string;
  readonly filters?: {
    category?: string;
    tags?: string[];
    sortBy?: string;
  };
}

// Command implementations with Apple's principle of "it just works"
export class BookmarkModelCommandImpl implements BookmarkModelCommand {
  readonly type = 'BOOKMARK_MODEL' as const;

  constructor(
    public readonly userId: number,
    public readonly modelId: number,
    public readonly isBookmarked: boolean
  ) {}

  async execute(): Promise<boolean> {
    try {
      const method = this.isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/bookmarks/${this.userId}/${this.modelId}`, {
        method,
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Bookmark operation failed');
      }

      return !this.isBookmarked;
    } catch (error) {
      console.error('Bookmark command failed:', error);
      throw error;
    }
  }
}

export class LikeModelCommandImpl implements LikeModelCommand {
  readonly type = 'LIKE_MODEL' as const;

  constructor(
    public readonly userId: number,
    public readonly modelId: number,
    public readonly isLiked: boolean
  ) {}

  async execute(): Promise<boolean> {
    try {
      const method = this.isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/likes/${this.userId}/${this.modelId}`, {
        method,
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Like operation failed');
      }

      return !this.isLiked;
    } catch (error) {
      console.error('Like command failed:', error);
      throw error;
    }
  }
}

export class TrackModelInteractionCommandImpl implements TrackModelInteractionCommand {
  readonly type = 'TRACK_MODEL_INTERACTION' as const;

  constructor(
    public readonly userId: number,
    public readonly modelId: number,
    public readonly interactionType: 'view' | 'click' | 'bookmark' | 'like' | 'share',
    public readonly engagementLevel: number,
    public readonly sessionDuration: number = 0,
    public readonly deviceType: 'mobile' | 'tablet' | 'desktop'
  ) {}

  async execute(): Promise<void> {
    try {
      await fetch('/api/interactions/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          modelId: this.modelId,
          interactionType: this.interactionType,
          engagementLevel: this.engagementLevel,
          sessionDuration: this.sessionDuration,
          deviceType: this.deviceType,
          referralSource: 'models_page'
        })
      });
    } catch (error) {
      // Graceful degradation - analytics failure shouldn't break UX
      console.log('Interaction tracking temporarily unavailable');
    }
  }
}