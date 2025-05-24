/**
 * Application Service: ImageFeedApplicationService
 * Following Clean Architecture - orchestrates domain and infrastructure layers
 * Implements facade pattern for simplified client interface
 */

import { GetRandomizedImageFeedQuery, type GetRandomizedImageFeedRequest, type GetRandomizedImageFeedResponse } from "../queries/GetRandomizedImageFeedQuery";
import { MarkImageAsViewedCommand, type MarkImageAsViewedRequest, type MarkImageAsViewedResponse } from "../commands/MarkImageAsViewedCommand";
import { type IImageFeedRepository } from "../../domain/repositories/IImageFeedRepository";
import { type IRandomizationService } from "../../domain/services/IRandomizationService";

export class ImageFeedApplicationService {
  private readonly getRandomizedImageFeedQuery: GetRandomizedImageFeedQuery;
  private readonly markImageAsViewedCommand: MarkImageAsViewedCommand;

  constructor(
    imageRepository: IImageFeedRepository,
    randomizationService: IRandomizationService
  ) {
    this.getRandomizedImageFeedQuery = new GetRandomizedImageFeedQuery(
      imageRepository,
      randomizationService
    );
    this.markImageAsViewedCommand = new MarkImageAsViewedCommand(imageRepository);
  }

  // Query operation: Get randomized image feed
  async getRandomizedImageFeed(request: GetRandomizedImageFeedRequest): Promise<GetRandomizedImageFeedResponse> {
    return await this.getRandomizedImageFeedQuery.execute(request);
  }

  // Command operation: Mark image as viewed
  async markImageAsViewed(request: MarkImageAsViewedRequest): Promise<MarkImageAsViewedResponse> {
    return await this.markImageAsViewedCommand.execute(request);
  }

  // Convenience method: Get next unique image
  async getNextUniqueImage(sessionId: string, userId?: number) {
    const feedResponse = await this.getRandomizedImageFeed({
      sessionId,
      userId,
      maxImages: 1
    });

    const nextImage = feedResponse.imageFeed.getNextUniqueImage();
    return {
      image: nextImage,
      hasMoreImages: feedResponse.hasMoreImages,
      remainingCount: feedResponse.remainingCount
    };
  }

  // Convenience method: Reset viewing session
  async resetViewingSession(sessionId: string): Promise<void> {
    // This could be implemented as a command if needed
    // For now, it's handled by generating a new session ID
  }
}