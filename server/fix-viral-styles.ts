/**
 * Add missing viral memes styles to the existing viral-memes category
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const viralMemesStyles = [
  {
    styleId: "gigachad-viral",
    name: "Gigachad",
    description: "The ultimate alpha male meme aesthetic",
    prompt: "gigachad, extremely muscular man, black and white filter, dramatic lighting, confident pose, meme aesthetic, viral internet culture",
    iconName: "User"
  },
  {
    styleId: "wojak-meme",
    name: "Wojak",
    description: "Classic internet meme character",
    prompt: "wojak character, simple drawn style, expressive face, meme culture, internet art style",
    iconName: "MessageCircle"
  },
  {
    styleId: "pepe-frog-meme",
    name: "Pepe the Frog",
    description: "Iconic meme frog character",
    prompt: "pepe the frog, green frog character, meme style, internet culture, expressive cartoon",
    iconName: "Smile"
  },
  {
    styleId: "distracted-boyfriend-meme",
    name: "Distracted Boyfriend",
    description: "Famous meme template aesthetic",
    prompt: "distracted boyfriend meme style, dramatic pointing, relationship drama, stock photo aesthetic, viral meme",
    iconName: "Eye"
  },
  {
    styleId: "drake-pointing-meme",
    name: "Drake Pointing",
    description: "Drake approval/disapproval meme style",
    prompt: "drake pointing meme style, approval gesture, hip hop aesthetic, meme template, viral culture",
    iconName: "ThumbsUp"
  }
];

const tiktokTrendyStyles = [
  {
    styleId: "core-girl-tiktok",
    name: "That Girl/Core Girl",
    description: "Clean girl aesthetic with organized lifestyle vibes",
    prompt: "that girl aesthetic, clean girl makeup, organized lifestyle, minimalist fashion, healthy glow, productive morning routine",
    iconName: "Sparkles"
  },
  {
    styleId: "y2k-revival-tiktok",
    name: "Y2K Revival",
    description: "Early 2000s nostalgic fashion comeback",
    prompt: "y2k fashion, early 2000s aesthetic, metallic clothing, chunky highlights, low rise jeans, nostalgic style",
    iconName: "Star"
  },
  {
    styleId: "cottagecore-tiktok",
    name: "Cottagecore",
    description: "Rural romanticized lifestyle aesthetic",
    prompt: "cottagecore aesthetic, rural lifestyle, vintage floral dresses, countryside vibes, romantic pastoral style",
    iconName: "Flower"
  },
  {
    styleId: "dark-academia-tiktok",
    name: "Dark Academia",
    description: "Scholarly gothic aesthetic with vintage books",
    prompt: "dark academia aesthetic, vintage scholarly style, gothic architecture, old books, tweed clothing, intellectual vibes",
    iconName: "Book"
  },
  {
    styleId: "coastal-grandmother-tiktok",
    name: "Coastal Grandmother",
    description: "Relaxed beach house luxury aesthetic",
    prompt: "coastal grandmother aesthetic, linen clothing, beach house vibes, nautical style, relaxed luxury, seaside comfort",
    iconName: "Waves"
  }
];

async function addMissingStyles() {
  console.log('Adding missing viral memes and TikTok styles...');
  
  try {
    // Add viral memes styles
    console.log('Adding viral memes styles...');
    for (const style of viralMemesStyles) {
      const existingStyle = await db
        .select()
        .from(cosplayStyles)
        .where(eq(cosplayStyles.styleId, style.styleId))
        .limit(1);
      
      if (existingStyle.length === 0) {
        await db.insert(cosplayStyles).values({
          styleId: style.styleId,
          categoryId: 'viral-memes',
          name: style.name,
          description: style.description,
          prompt: style.prompt,
          negativePrompt: null,
          iconName: style.iconName,
          previewImage: null,
          popular: 0,
          premium: 0,
          difficulty: 'medium',
          tags: null,
          usageCount: 0,
        });
        console.log(`  Added viral style: ${style.name}`);
      }
    }

    // Add TikTok trendy styles
    console.log('Adding TikTok trendy styles...');
    for (const style of tiktokTrendyStyles) {
      const existingStyle = await db
        .select()
        .from(cosplayStyles)
        .where(eq(cosplayStyles.styleId, style.styleId))
        .limit(1);
      
      if (existingStyle.length === 0) {
        await db.insert(cosplayStyles).values({
          styleId: style.styleId,
          categoryId: 'tiktok',
          name: style.name,
          description: style.description,
          prompt: style.prompt,
          negativePrompt: null,
          iconName: style.iconName,
          previewImage: null,
          popular: 0,
          premium: 0,
          difficulty: 'medium',
          tags: null,
          usageCount: 0,
        });
        console.log(`  Added TikTok style: ${style.name}`);
      }
    }
    
    console.log('Successfully added missing styles!');
  } catch (error) {
    console.error('Error adding styles:', error);
    throw error;
  }
}

// Run the migration
addMissingStyles().catch(console.error);