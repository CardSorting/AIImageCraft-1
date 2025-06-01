/**
 * Add more viral memes and internet culture styles
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const additionalViralStyles = [
  {
    styleId: "doge-meme",
    name: "Doge",
    description: "Much wow, very meme, such aesthetic",
    prompt: "doge meme, shiba inu dog, comic sans font, colorful text overlay, such wow, very aesthetic, internet culture",
    iconName: "Heart"
  },
  {
    styleId: "woman-yelling-cat",
    name: "Woman Yelling at Cat",
    description: "Iconic dinner table argument meme",
    prompt: "woman yelling at cat meme style, dramatic pointing, confused cat at dinner table, viral meme aesthetic",
    iconName: "MessageSquare"
  },
  {
    styleId: "this-is-fine",
    name: "This Is Fine",
    description: "Dog in burning room keeping calm",
    prompt: "this is fine meme, dog sitting in burning room, coffee cup, calm expression, everything is fine, dark humor",
    iconName: "Coffee"
  },
  {
    styleId: "stonks-meme",
    name: "Stonks",
    description: "Financial success meme man",
    prompt: "stonks meme, surreal meme man, financial success, stock market, meme economy, orange suit",
    iconName: "TrendingUp"
  },
  {
    styleId: "galaxy-brain",
    name: "Galaxy Brain",
    description: "Expanding brain enlightenment meme",
    prompt: "galaxy brain meme, expanding brain, cosmic enlightenment, glowing head, transcendent knowledge, meme wisdom",
    iconName: "Brain"
  },
  {
    styleId: "chad-vs-virgin",
    name: "Chad vs Virgin",
    description: "Chad and virgin comparison meme",
    prompt: "chad vs virgin meme, confident chad, awkward virgin, comparison meme, internet culture stereotype",
    iconName: "Users"
  },
  {
    styleId: "surprised-pikachu",
    name: "Surprised Pikachu",
    description: "Shocked pokemon reaction face",
    prompt: "surprised pikachu meme, shocked pokemon face, open mouth expression, yellow electric mouse, reaction meme",
    iconName: "Zap"
  },
  {
    styleId: "grumpy-cat",
    name: "Grumpy Cat",
    description: "Eternally displeased feline",
    prompt: "grumpy cat meme, permanently annoyed cat expression, frowning feline, internet celebrity pet, meme legend",
    iconName: "Frown"
  },
  {
    styleId: "nyan-cat",
    name: "Nyan Cat",
    description: "Rainbow-trailing space cat",
    prompt: "nyan cat, pixel art cat, rainbow trail, pop tart body, space background, 8-bit aesthetic, viral animation",
    iconName: "Rainbow"
  },
  {
    styleId: "rickroll",
    name: "Rickroll",
    description: "Never gonna give you up aesthetic",
    prompt: "rickroll meme, rick astley, 80s music video aesthetic, never gonna give you up, internet prank culture",
    iconName: "Music"
  },
  {
    styleId: "kermit-tea",
    name: "Kermit Sipping Tea",
    description: "But that's none of my business",
    prompt: "kermit sipping tea meme, green frog, tea cup, but that's none of my business, passive aggressive meme",
    iconName: "Coffee"
  },
  {
    styleId: "success-kid",
    name: "Success Kid",
    description: "Fist-pumping baby victory",
    prompt: "success kid meme, baby fist pump, determined expression, beach sand, viral success celebration",
    iconName: "Trophy"
  }
];

async function expandViralMemes() {
  console.log('Adding more viral memes styles...');
  
  try {
    for (const style of additionalViralStyles) {
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
        console.log(`  Added viral meme: ${style.name}`);
      } else {
        console.log(`  ${style.name} already exists, skipping...`);
      }
    }
    
    console.log('Successfully expanded viral memes collection!');
  } catch (error) {
    console.error('Error adding viral memes:', error);
    throw error;
  }
}

// Run the expansion
expandViralMemes().catch(console.error);