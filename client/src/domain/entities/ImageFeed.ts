/**
 * Domain Entity: ImageFeed
 * Aggregate root for managing randomized image feed
 * Following DDD principles with business rules for unique image display
 */

import { type GeneratedImage } from "@shared/schema";
import { ViewedImage } from "./ViewedImage";

export interface ImageFeedData {
  sessionId: string;
  userId?: number;
  images: GeneratedImage[];
  viewedImages: ViewedImage[];
}

export class ImageFeed {
  private constructor(
    private readonly _sessionId: string,
    private readonly _userId: number | undefined,
    private _images: GeneratedImage[],
    private _viewedImages: ViewedImage[]
  ) {}

  static create(data: ImageFeedData): ImageFeed {
    return new ImageFeed(
      data.sessionId,
      data.userId,
      data.images,
      data.viewedImages
    );
  }

  get sessionId(): string {
    return this._sessionId;
  }

  get userId(): number | undefined {
    return this._userId;
  }

  get images(): readonly GeneratedImage[] {
    return this._images;
  }

  get viewedImages(): readonly ViewedImage[] {
    return this._viewedImages;
  }

  // Business rule: Get next unique image that hasn't been viewed
  getNextUniqueImage(): GeneratedImage | null {
    const viewedImageIds = new Set(
      this._viewedImages
        .filter(vi => vi.belongsToSession(this._sessionId))
        .map(vi => vi.id)
    );

    const unseenImages = this._images.filter(image => 
      !viewedImageIds.has(image.id)
    );

    if (unseenImages.length === 0) {
      return null; // All images have been viewed
    }

    // Return random unseen image
    const randomIndex = Math.floor(Math.random() * unseenImages.length);
    return unseenImages[randomIndex];
  }

  // Business rule: Get randomized queue of unseen images
  getRandomizedUnseenQueue(): GeneratedImage[] {
    const viewedImageIds = new Set(
      this._viewedImages
        .filter(vi => vi.belongsToSession(this._sessionId))
        .map(vi => vi.id)
    );

    const unseenImages = this._images.filter(image => 
      !viewedImageIds.has(image.id)
    );

    // Fisher-Yates shuffle algorithm for true randomization
    const shuffled = [...unseenImages];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  // Business rule: Mark image as viewed
  markImageAsViewed(imageId: number): void {
    const existingView = this._viewedImages.find(vi => 
      vi.id === imageId && vi.belongsToSession(this._sessionId)
    );

    if (!existingView) {
      const viewedImage = ViewedImage.create({
        id: imageId,
        viewedAt: new Date(),
        sessionId: this._sessionId,
        userId: this._userId
      });

      this._viewedImages = [...this._viewedImages, viewedImage];
    }
  }

  // Business rule: Check if all images have been viewed
  areAllImagesViewed(): boolean {
    const viewedImageIds = new Set(
      this._viewedImages
        .filter(vi => vi.belongsToSession(this._sessionId))
        .map(vi => vi.id)
    );

    return this._images.every(image => viewedImageIds.has(image.id));
  }

  // Business rule: Reset viewing session (for new session or refresh)
  resetViewingSession(newSessionId: string): ImageFeed {
    return ImageFeed.create({
      sessionId: newSessionId,
      userId: this._userId,
      images: this._images,
      viewedImages: this._viewedImages.filter(vi => 
        !vi.belongsToSession(this._sessionId)
      )
    });
  }

  // Business rule: Get remaining unseen count
  getRemainingUnseenCount(): number {
    const viewedImageIds = new Set(
      this._viewedImages
        .filter(vi => vi.belongsToSession(this._sessionId))
        .map(vi => vi.id)
    );

    return this._images.filter(image => 
      !viewedImageIds.has(image.id)
    ).length;
  }
}