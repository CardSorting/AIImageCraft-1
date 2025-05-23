/**
 * Card Rarity System for AI Image Studio
 * Y2K Trading Card Game inspired rarity calculator
 */

interface RarityResult {
  tier: string;
  score: number;
  stars: number;
  letter: string;
}

const RARITY_TIERS = {
  COMMON: { name: 'Common', stars: 1, letter: 'C', probability: 0.50 },
  UNCOMMON: { name: 'Uncommon', stars: 2, letter: 'U', probability: 0.30 },
  RARE: { name: 'Rare', stars: 3, letter: 'R', probability: 0.15 },
  EPIC: { name: 'Epic', stars: 4, letter: 'E', probability: 0.04 },
  LEGENDARY: { name: 'Legendary', stars: 5, letter: 'L', probability: 0.009 },
  MYTHIC: { name: 'Mythic', stars: 6, letter: 'M', probability: 0.001 }
};

export function generateCardRarity(prompt: string): RarityResult {
  // Calculate rarity boost based on prompt quality
  let rarityBoost = 0;
  const promptLower = prompt.toLowerCase();
  
  // High-quality artistic keywords
  const premiumKeywords = [
    'masterpiece', 'photorealistic', '8k', '4k', 'ultra detailed',
    'cinematic', 'dramatic lighting', 'ethereal', 'mystical', 'epic',
    'legendary', 'divine', 'celestial', 'otherworldly', 'surreal'
  ];
  
  const fantasyKeywords = [
    'dragon', 'phoenix', 'unicorn', 'magic', 'fantasy', 'mythical',
    'enchanted', 'cosmic', 'galactic', 'dimensional', 'arcane'
  ];

  // Apply keyword boosts
  premiumKeywords.forEach(keyword => {
    if (promptLower.includes(keyword)) rarityBoost += 0.12;
  });
  
  fantasyKeywords.forEach(keyword => {
    if (promptLower.includes(keyword)) rarityBoost += 0.08;
  });

  // Length and complexity bonus
  if (prompt.length > 100) rarityBoost += 0.05;
  if (prompt.length > 200) rarityBoost += 0.08;

  // Generate rarity with boost applied
  const baseRandom = Math.random();
  const boostedRandom = Math.min(0.99, baseRandom + rarityBoost);
  
  let cumulativeProbability = 0;
  
  for (const [tierKey, tier] of Object.entries(RARITY_TIERS)) {
    cumulativeProbability += tier.probability;
    if (boostedRandom <= cumulativeProbability) {
      const baseScore = getBaseScore(tierKey);
      const variance = (Math.random() - 0.5) * 10; // ±5 variance
      const score = Math.max(0, Math.min(100, baseScore + variance));
      
      return {
        tier: tierKey,
        score: Math.round(score * 10) / 10,
        stars: tier.stars,
        letter: tier.letter
      };
    }
  }

  // Fallback to common (should never reach here)
  return {
    tier: 'COMMON',
    score: 50,
    stars: 1,
    letter: 'C'
  };
}

function getBaseScore(tierKey: string): number {
  const scoreRanges: Record<string, number> = {
    COMMON: 25,
    UNCOMMON: 45,
    RARE: 65,
    EPIC: 80,
    LEGENDARY: 92,
    MYTHIC: 98
  };
  return scoreRanges[tierKey] || 50;
}