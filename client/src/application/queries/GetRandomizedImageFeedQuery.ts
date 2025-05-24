/**
 * Application Query: GetRandomizedImageFeedQuery
 * Following CQRS Query pattern - read-only operations
 * Handles complex business logic for randomized image feeds
 */

import { ImageFeed } from "../../domain/entities/ImageFeed";
import { type IImageFeedRepository } from "../../domain/repositories/IImageFeedRepository";
import { type IRandomizationService } from "../../domain/services/IRandomizationService";

export interface GetRandomizedImageFeedRequest {
  sessionId: string;
  userId?: number;
  maxImages?: number;
}

export interface GetRandomizedImageFeedResponse {
  imageFeed: ImageFeed;
  hasMoreImages: boolean;
  remainingCount: number;
}

export class GetRandomizedImageFeedQuery {
  constructor(
    private readonly imageRepository: IImageFeedRepository,
    private readonly randomizationService: IRandomizationService
  ) {}

  async execute(request: GetRandomizedImageFeedRequest): Promise<GetRandomizedImageFeedResponse> {
    // Fetch all available images and viewed history
    const [allImages, viewedImages] = await Promise.all([
      this.imageRepository.getAllImages(),
      this.imageRepository.getViewedImages(request.sessionId, request.userId)
    ]);

    // Create image feed aggregate
    const imageFeed = ImageFeed.create({
      sessionId: request.sessionId,
      userId: request.userId,
      images: allImages,
      viewedImages: viewedImages
    });

    // Get randomized queue of unseen images
    const unseenQueue = imageFeed.getRandomizedUnseenQueue();
    
    // Limit to requested max images if specified
    const limitedQueue = request.maxImages 
      ? unseenQueue.slice(0, request.maxImages)
      : unseenQueue;

    // Create new feed with limited queue
    const limitedImageFeed = ImageFeed.create({
      sessionId: request.sessionId,
      userId: request.userId,
      images: limitedQueue,
      viewedImages: viewedImages
    });

    return {
      imageFeed: limitedImageFeed,
      hasMoreImages: unseenQueue.length > limitedQueue.length,
      remainingCount: imageFeed.getRemainingUnseenCount()
    };
  }
}