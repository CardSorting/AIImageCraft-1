/**
 * Update prompts to be more character-consistent and less aggressive
 * Focus on costume, styling, and accessories while preserving facial features
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const updatedPrompts = [
  // Anime styles - focus on styling not transformation
  {
    styleId: "anime-hero",
    prompt: "styled as an anime hero with spiky anime-style hair, wearing a heroic costume with cape, maintaining their facial features and identity"
  },
  {
    styleId: "magical-girl",
    prompt: "dressed as a magical girl with colorful frilly costume, tiara, and magical wand, keeping their natural face and expression"
  },
  {
    styleId: "ninja",
    prompt: "wearing traditional ninja outfit with mask covering lower face, dark clothing and ninja accessories, preserving their eyes and upper facial features"
  },

  // Viral memes - focus on expressions and accessories
  {
    styleId: "doge-meme",
    prompt: "making the classic doge expression with raised eyebrows and slight smile, wearing golden retriever ears as accessories"
  },
  {
    styleId: "pepe-frog-meme",
    prompt: "making a pepe-style facial expression with slight smirk, wearing green frog hat or headpiece"
  },
  {
    styleId: "surprised-pikachu",
    prompt: "making a surprised facial expression with wide eyes and open mouth, wearing yellow Pikachu ears and red cheek circles"
  },
  {
    styleId: "stonks-meme",
    prompt: "wearing a business suit with tie, holding financial charts, making a confident business expression"
  },
  {
    styleId: "this-is-fine",
    prompt: "sitting calmly with a slight smile while surrounded by flame effects in the background, wearing casual clothing"
  },

  // Sports athletes - focus on uniforms and poses
  {
    styleId: "michael-jordan",
    prompt: "wearing Chicago Bulls red basketball uniform number 23, in a basketball pose with ball, maintaining their facial features"
  },
  {
    styleId: "lebron-james",
    prompt: "wearing Lakers purple and gold basketball uniform, in an athletic basketball stance, keeping their natural appearance"
  },
  {
    styleId: "cristiano-ronaldo",
    prompt: "wearing Real Madrid white soccer jersey, in a soccer pose with ball, preserving their facial identity"
  },
  {
    styleId: "lionel-messi",
    prompt: "wearing Barcelona blue and red soccer jersey, in a soccer dribbling pose, maintaining their facial characteristics"
  },
  {
    styleId: "tom-brady",
    prompt: "wearing New England Patriots football uniform, in quarterback throwing pose with football, keeping their natural face"
  },

  // Character styles - focus on costumes
  {
    styleId: "gojo-jujutsu",
    prompt: "wearing Satoru Gojo's black uniform with high collar, stylish sunglasses, white hair styled up, maintaining facial structure"
  },
  {
    styleId: "nezuko-demon",
    prompt: "wearing Nezuko's pink kimono with bamboo muzzle accessory, pink hair ribbons, preserving their facial features"
  },
  {
    styleId: "naruto-hokage",
    prompt: "wearing orange and black ninja outfit with headband, blonde spiky hair styled as Naruto, keeping their face shape"
  }
];

async function updateCharacterConsistentPrompts() {
  console.log('Updating prompts for better character consistency...');
  
  try {
    for (const update of updatedPrompts) {
      const result = await db
        .update(cosplayStyles)
        .set({ prompt: update.prompt })
        .where(eq(cosplayStyles.styleId, update.styleId));
      
      console.log(`  Updated prompt for: ${update.styleId}`);
    }
    
    console.log('Successfully updated prompts for character consistency!');
  } catch (error) {
    console.error('Error updating prompts:', error);
    throw error;
  }
}

// Run the update
updateCharacterConsistentPrompts().catch(console.error);