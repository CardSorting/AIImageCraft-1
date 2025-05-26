/**
 * Bookmark Repository Interface
 * Domain Layer - Pure Business Logic, Zero Dependencies
 * 
 * Following Apple's Design Philosophy:
 * ✓ Simple, Predictable Interface
 * ✓ Clear Method Names
 * ✓ Minimal Surface Area
 * ✓ Fail-Fast Error Handling
 */

import { Bookmark } from '../entities/Bookmark';

export interface BookmarkRepository {
  // Core CRUD Operations
  save(bookmark: Bookmark): Promise<void>;
  findById(bookmarkId: string): Promise<Bookmark | null>;
  findByUserAndModel(userId: number, modelId: number): Promise<Bookmark | null>;
  remove(bookmarkId: string): Promise<void>;
  
  // Business Queries
  findAllByUser(userId: number): Promise<Bookmark[]>;
  findActiveByUser(userId: number): Promise<Bookmark[]>;
  exists(userId: number, modelId: number): Promise<boolean>;
  
  // Aggregations for UI
  countByUser(userId: number): Promise<number>;
  countByModel(modelId: number): Promise<number>;
}