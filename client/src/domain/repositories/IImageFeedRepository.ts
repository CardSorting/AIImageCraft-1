/**
 * Domain Repository Interface: IImageFeedRepository
 * Following Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP)
 * Defines contracts for image feed data access without implementation details
 */

import { type GeneratedImage } from "@shared/schema";
import { ViewedImage } from "../entities/ViewedImage";

export interface IImageFeedRepository {
  // Query operations (CQRS Read side)
  getAllImages(): Promise<GeneratedImage[]>;
  getViewedImages(sessionId: string, userId?: number): Promise<ViewedImage[]>;
  
  // Command operations (CQRS Write side)
  saveViewedImage(viewedImage: ViewedImage): Promise<void>;
  clearSessionViewedImages(sessionId: string): Promise<void>;
}