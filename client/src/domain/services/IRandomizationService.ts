/**
 * Domain Service Interface: IRandomizationService
 * Following Single Responsibility Principle (SRP) - handles only randomization logic
 * Domain service for complex randomization algorithms
 */

import { type GeneratedImage } from "@shared/schema";

export interface RandomizationOptions {
  seed?: string;
  excludeIds?: number[];
  preferenceWeights?: Map<string, number>; // For future ML-based recommendations
}

export interface IRandomizationService {
  // Core randomization with cryptographically secure randomness
  shuffleArray<T>(array: T[], options?: RandomizationOptions): T[];
  
  // Weighted randomization for personalized feeds
  selectRandomWithWeights<T>(
    items: T[], 
    weightFunction: (item: T) => number,
    options?: RandomizationOptions
  ): T | null;
  
  // Generate session-based random seed
  generateSessionSeed(): string;
  
  // Advanced randomization preventing clustering
  distributeRandomly<T>(
    items: T[],
    distributionFunction: (item: T) => number,
    options?: RandomizationOptions
  ): T[];
}