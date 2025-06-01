/**
 * Neutralize all existing prompts to remove character names and problematic language
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Replace specific character names with neutral descriptions
 */
function neutralizeCharacterNames(prompt: string): string {
  const characterReplacements: { [key: string]: string } = {
    // Disney Characters
    'Elsa': 'ice queen character with blue dress',
    'Anna': 'adventurous princess with braided hair',
    'Ariel': 'mermaid character with red hair',
    'Belle': 'bookish princess in yellow gown',
    'Cinderella': 'fairy tale princess in blue gown',
    'Snow White': 'classic princess with red bow',
    'Rapunzel': 'long-haired princess',
    'Moana': 'island princess with flower crown',
    'Mulan': 'warrior princess in armor',
    'Tiana': 'green dress princess',
    
    // Marvel/DC Characters  
    'Thor': 'Norse god with hammer and cape',
    'Loki': 'trickster character with horned helmet',
    'Batman': 'dark knight vigilante',
    'Superman': 'blue and red superhero',
    'Wonder Woman': 'amazonian warrior princess',
    'Spider-Man': 'web-slinging hero in red suit',
    'Iron Man': 'armored superhero',
    'Captain America': 'patriotic shield-bearing hero',
    'Deadpool': 'red masked anti-hero',
    'Wolverine': 'clawed mutant hero',
    
    // Anime Characters
    'Goku': 'martial artist in orange gi',
    'Naruto': 'ninja in orange jumpsuit',
    'Sailor Moon': 'magical girl in sailor outfit',
    'Nezuko': 'demon character with bamboo',
    'Gojo': 'white-haired sorcerer with blindfold',
    'Luffy': 'straw hat pirate captain',
    'Ichigo': 'soul reaper with large sword',
    'Edward Elric': 'alchemist with red coat',
    'Tanjiro': 'demon slayer with checkered haori',
    
    // Gaming Characters
    'Link': 'green-clad hero with sword',
    'Mario': 'red-capped plumber',
    'Luigi': 'green-capped plumber',
    'Pikachu': 'yellow electric creature',
    'Sonic': 'blue speedster hedgehog',
    'Master Chief': 'armored space marine',
    'Lara Croft': 'adventurous archaeologist',
    
    // Other Popular Characters
    'Hermione': 'student wizard with curly hair',
    'Harry Potter': 'young wizard with glasses',
    'Gandalf': 'wise wizard with staff',
    'Legolas': 'elven archer',
    'Frodo': 'hobbit adventurer',
    'Jon Snow': 'northern warrior',
    'Daenerys': 'dragon queen',
    'Finn': 'adventurous boy with hat',
    'Jake': 'shapeshifting dog companion',
  };
  
  let neutralizedPrompt = prompt;
  
  // Apply replacements (case insensitive)
  Object.entries(characterReplacements).forEach(([name, replacement]) => {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    neutralizedPrompt = neutralizedPrompt.replace(regex, replacement);
  });
  
  return neutralizedPrompt;
}

/**
 * Clean and neutralize a prompt
 */
function cleanPrompt(instruction: string): string {
  // Remove the verbose prefix if it exists
  let cleanInstruction = instruction
    .replace("Professional costume styling and makeup transformation: ", "")
    .replace(/, maintaining the person's natural facial features.*$/, "");
  
  // Remove problematic transformation language
  cleanInstruction = cleanInstruction
    .replace(/transform this person into/gi, "")
    .replace(/transform into/gi, "")
    .replace(/turn into/gi, "")
    .replace(/become/gi, "")
    .replace(/change into/gi, "")
    .replace(/makeup transformation/gi, "costume")
    .replace(/transformation/gi, "costume")
    .replace(/cosplay styling as/gi, "");
  
  // Apply character name neutralization
  const neutralInstruction = neutralizeCharacterNames(cleanInstruction);
  
  // Clean up extra spaces and trim
  return neutralInstruction.replace(/\s+/g, ' ').trim();
}

async function neutralizeAllPrompts() {
  console.log('Starting neutralization of all cosplay style prompts...');
  
  try {
    // Get all existing styles
    const allStyles = await db.select().from(cosplayStyles);
    console.log(`Found ${allStyles.length} styles to process`);
    
    let updatedCount = 0;
    
    for (const style of allStyles) {
      const originalPrompt = style.prompt;
      const cleanedPrompt = cleanPrompt(originalPrompt);
      
      // Only update if the prompt actually changed
      if (cleanedPrompt !== originalPrompt && cleanedPrompt.length > 0) {
        await db
          .update(cosplayStyles)
          .set({ prompt: cleanedPrompt })
          .where(eq(cosplayStyles.styleId, style.styleId));
        
        console.log(`  ✓ Updated: ${style.styleId}`);
        console.log(`    Before: ${originalPrompt.substring(0, 80)}...`);
        console.log(`    After: ${cleanedPrompt.substring(0, 80)}...`);
        updatedCount++;
      } else {
        console.log(`  - Skipped: ${style.styleId} (no changes needed)`);
      }
    }
    
    console.log(`\nSuccessfully neutralized ${updatedCount} out of ${allStyles.length} prompts!`);
    console.log('All prompts now use neutral descriptions without character names.');
    
  } catch (error) {
    console.error('Error neutralizing prompts:', error);
    throw error;
  }
}

// Run the neutralization
neutralizeAllPrompts()
  .then(() => {
    console.log('Prompt neutralization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Prompt neutralization failed:', error);
    process.exit(1);
  });