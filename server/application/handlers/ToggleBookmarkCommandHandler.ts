/**
 * CQRS Command Handler for Bookmark Operations
 * Implements Clean Architecture with domain service integration
 */

import { ToggleBookmarkCommand } from '../commands/ToggleBookmarkCommand.js';
import { UserInteractionService, UserInteractionData } from '../../domain/services/UserInteractionService.js';
import { IStorage } from '../../storage.js';

export interface IToggleBookmarkCommandHandler {
  handle(command: ToggleBookmarkCommand): Promise<UserInteractionData>;
}

export class ToggleBookmarkCommandHandler implements IToggleBookmarkCommandHandler {
  private userInteractionService: UserInteractionService;

  constructor(private storage: IStorage) {
    this.userInteractionService = new UserInteractionService(storage);
  }

  async handle(command: ToggleBookmarkCommand): Promise<UserInteractionData> {
    // Validate command
    if (!command.validate()) {
      throw new Error('Invalid bookmark command: userId and modelId must be positive integers');
    }

    try {
      // Use domain service to handle business logic
      const result = await this.userInteractionService.toggleBookmark(
        command.userId,
        command.modelId
      );

      // Track the bookmark interaction for personalization
      await this.storage.createUserInteraction({
        userId: command.userId,
        modelId: command.modelId,
        interactionType: 'bookmark',
        engagementLevel: result.isBookmarked ? 9 : 4, // High engagement for bookmark, low for unbookmark
        sessionDuration: 0,
        deviceType: 'web',
        referralSource: 'manual'
      });

      return result;
    } catch (error) {
      console.error('Error handling bookmark command:', error);
      throw new Error('Failed to toggle bookmark state');
    }
  }
}