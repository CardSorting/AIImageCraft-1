/**
 * Infrastructure Service: CryptoRandomizationService
 * Following Single Responsibility Principle (SRP) - handles cryptographically secure randomization
 * Uses Web Crypto API for high-quality randomness
 */

import { type IRandomizationService, type RandomizationOptions } from "../../domain/services/IRandomizationService";

export class CryptoRandomizationService implements IRandomizationService {
  
  // Generate cryptographically secure random values
  private getSecureRandom(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }

  // Generate session-based random seed
  generateSessionSeed(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Fisher-Yates shuffle with crypto-secure randomness
  shuffleArray<T>(array: T[], options?: RandomizationOptions): T[] {
    const result = [...array];
    
    // Filter out excluded items if specified
    const filtered = options?.excludeIds 
      ? result.filter((item: any) => !options.excludeIds?.includes(item.id))
      : result;

    // Shuffle using Fisher-Yates algorithm with crypto randomness
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(this.getSecureRandom() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    return filtered;
  }

  // Weighted random selection with crypto-secure randomness
  selectRandomWithWeights<T>(
    items: T[], 
    weightFunction: (item: T) => number,
    options?: RandomizationOptions
  ): T | null {
    if (items.length === 0) return null;

    // Filter excluded items
    const filtered = options?.excludeIds 
      ? items.filter((item: any) => !options.excludeIds?.includes(item.id))
      : items;

    if (filtered.length === 0) return null;

    // Calculate total weight
    const totalWeight = filtered.reduce((sum, item) => sum + weightFunction(item), 0);
    
    if (totalWeight <= 0) {
      // Fallback to uniform distribution if no positive weights
      const randomIndex = Math.floor(this.getSecureRandom() * filtered.length);
      return filtered[randomIndex];
    }

    // Select based on weighted probability
    let randomValue = this.getSecureRandom() * totalWeight;
    
    for (const item of filtered) {
      randomValue -= weightFunction(item);
      if (randomValue <= 0) {
        return item;
      }
    }

    // Fallback (should not reach here)
    return filtered[filtered.length - 1];
  }

  // Advanced distribution to prevent clustering
  distributeRandomly<T>(
    items: T[],
    distributionFunction: (item: T) => number,
    options?: RandomizationOptions
  ): T[] {
    const filtered = options?.excludeIds 
      ? items.filter((item: any) => !options.excludeIds?.includes(item.id))
      : items;

    // Group items by distribution value
    const groups = new Map<number, T[]>();
    
    filtered.forEach(item => {
      const dist = distributionFunction(item);
      if (!groups.has(dist)) {
        groups.set(dist, []);
      }
      groups.get(dist)!.push(item);
    });

    // Shuffle each group independently
    const shuffledGroups = Array.from(groups.entries()).map(([dist, groupItems]) => ({
      distribution: dist,
      items: this.shuffleArray(groupItems)
    }));

    // Sort groups by distribution value
    shuffledGroups.sort((a, b) => a.distribution - b.distribution);

    // Interleave items from different groups to prevent clustering
    const result: T[] = [];
    const maxGroupSize = Math.max(...shuffledGroups.map(g => g.items.length));

    for (let i = 0; i < maxGroupSize; i++) {
      for (const group of shuffledGroups) {
        if (i < group.items.length) {
          result.push(group.items[i]);
        }
      }
    }

    return result;
  }
}