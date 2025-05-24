/**
 * Application Command: MarkImageAsViewedCommand
 * Following CQRS Command pattern - write operations
 * Handles state changes for user viewing behavior
 */

import { ViewedImage } from "../../domain/entities/ViewedImage";
import { type IImageFeedRepository } from "../../domain/repositories/IImageFeedRepository";

export interface MarkImageAsViewedRequest {
  imageId: number;
  sessionId: string;
  userId?: number;
}

export interface MarkImageAsViewedResponse {
  success: boolean;
  viewedImage: ViewedImage;
}

export class MarkImageAsViewedCommand {
  constructor(
    private readonly imageRepository: IImageFeedRepository
  ) {}

  async execute(request: MarkImageAsViewedRequest): Promise<MarkImageAsViewedResponse> {
    // Create viewed image entity with business rules
    const viewedImage = ViewedImage.create({
      id: request.imageId,
      viewedAt: new Date(),
      sessionId: request.sessionId,
      userId: request.userId
    });

    // Persist the viewed state
    await this.imageRepository.saveViewedImage(viewedImage);

    return {
      success: true,
      viewedImage
    };
  }
}