/**
 * Style Selection Command Handlers
 * CQRS Command Side - Write operations for style interactions
 * Following Apple's user-centric design principles
 */

export interface SelectStyleCommand {
  readonly type: 'SELECT_STYLE';
  readonly styleId: string;
  readonly userId?: string;
  readonly timestamp: Date;
}

export interface BookmarkStyleCommand {
  readonly type: 'BOOKMARK_STYLE';
  readonly styleId: string;
  readonly userId: string;
  readonly bookmarked: boolean;
}

export interface TrackStyleInteractionCommand {
  readonly type: 'TRACK_STYLE_INTERACTION';
  readonly styleId: string;
  readonly userId?: string;
  readonly interactionType: 'view' | 'select' | 'share' | 'favorite';
  readonly metadata?: Record<string, unknown>;
}

export type StyleSelectionCommand = 
  | SelectStyleCommand
  | BookmarkStyleCommand
  | TrackStyleInteractionCommand;

export interface StyleSelectionResult {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: unknown;
}

export class StyleSelectionCommandHandler {
  public async handle(command: StyleSelectionCommand): Promise<StyleSelectionResult> {
    switch (command.type) {
      case 'SELECT_STYLE':
        return this.handleSelectStyle(command);
      
      case 'BOOKMARK_STYLE':
        return this.handleBookmarkStyle(command);
      
      case 'TRACK_STYLE_INTERACTION':
        return this.handleTrackInteraction(command);
      
      default:
        return {
          success: false,
          message: 'Unknown command type'
        };
    }
  }

  private async handleSelectStyle(command: SelectStyleCommand): Promise<StyleSelectionResult> {
    try {
      // Store selection in local storage for immediate UI feedback
      const recentStyles = this.getRecentStyles();
      const updatedRecent = [
        command.styleId,
        ...recentStyles.filter(id => id !== command.styleId)
      ].slice(0, 10);
      
      localStorage.setItem('recent_styles', JSON.stringify(updatedRecent));
      
      // Track interaction if user is available
      if (command.userId) {
        await this.trackStyleUsage(command.styleId, command.userId, 'select');
      }
      
      return {
        success: true,
        data: { styleId: command.styleId, recentStyles: updatedRecent }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to select style'
      };
    }
  }

  private async handleBookmarkStyle(command: BookmarkStyleCommand): Promise<StyleSelectionResult> {
    try {
      const bookmarks = this.getUserBookmarks(command.userId);
      let updatedBookmarks: string[];
      
      if (command.bookmarked) {
        updatedBookmarks = [...bookmarks, command.styleId];
      } else {
        updatedBookmarks = bookmarks.filter(id => id !== command.styleId);
      }
      
      localStorage.setItem(`bookmarks_${command.userId}`, JSON.stringify(updatedBookmarks));
      
      await this.trackStyleUsage(command.styleId, command.userId, 'favorite');
      
      return {
        success: true,
        data: { bookmarked: command.bookmarked, bookmarks: updatedBookmarks }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to bookmark style'
      };
    }
  }

  private async handleTrackInteraction(command: TrackStyleInteractionCommand): Promise<StyleSelectionResult> {
    try {
      if (command.userId) {
        await this.trackStyleUsage(command.styleId, command.userId, command.interactionType);
      }
      
      // Update local interaction counts
      const interactions = this.getStyleInteractions();
      interactions[command.styleId] = (interactions[command.styleId] || 0) + 1;
      localStorage.setItem('style_interactions', JSON.stringify(interactions));
      
      return {
        success: true,
        data: { interactions }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to track interaction'
      };
    }
  }

  private getRecentStyles(): string[] {
    try {
      const stored = localStorage.getItem('recent_styles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getUserBookmarks(userId: string): string[] {
    try {
      const stored = localStorage.getItem(`bookmarks_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getStyleInteractions(): Record<string, number> {
    try {
      const stored = localStorage.getItem('style_interactions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private async trackStyleUsage(
    styleId: string, 
    userId: string, 
    interactionType: string
  ): Promise<void> {
    // This would integrate with the backend API for persistent tracking
    // For now, we'll handle it locally to maintain performance
    const trackingData = {
      styleId,
      userId,
      interactionType,
      timestamp: new Date().toISOString()
    };
    
    console.log('Style interaction tracked:', trackingData);
  }
}