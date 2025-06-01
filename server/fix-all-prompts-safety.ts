/**
 * Apply safety formatting to all existing cosplay style prompts
 * This ensures consistent content-filter safe prompts across all styles
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";

/**
 * Format prompts to be content-filter safe and character-consistent
 * Same logic as used in CosplayController
 */
function formatSafePrompt(instruction: string): string {
  // Base safety prefix that clarifies this is costume/styling transformation
  const safetyPrefix = "Professional costume styling and makeup transformation: ";
  
  // Character consistency suffix
  const consistencySuffix = ", maintaining the person's natural facial features, bone structure, and identity. Focus on costume, clothing, accessories, and styling elements only. High-quality professional cosplay photography.";
  
  // Clean the instruction to remove potentially problematic words
  let cleanInstruction = instruction
    .replace(/transform this person into/gi, "style this person as")
    .replace(/transform into/gi, "style as")
    .replace(/turn into/gi, "dress as")
    .replace(/become/gi, "cosplay as")
    .replace(/change into/gi, "wear costume of")
    .replace(/transformation/gi, "styling");
  
  // Ensure it starts with styling language
  if (!cleanInstruction.toLowerCase().includes("style") && 
      !cleanInstruction.toLowerCase().includes("costume") && 
      !cleanInstruction.toLowerCase().includes("cosplay") &&
      !cleanInstruction.toLowerCase().includes("dress") &&
      !cleanInstruction.toLowerCase().includes("wearing") &&
      !cleanInstruction.toLowerCase().includes("outfit")) {
    cleanInstruction = "cosplay styling as " + cleanInstruction;
  }
  
  return safetyPrefix + cleanInstruction + consistencySuffix;
}

async function fixAllPromptsSafety() {
  console.log('Starting comprehensive safety update for all cosplay style prompts...');
  
  try {
    // Get all existing styles
    const allStyles = await db.select().from(cosplayStyles);
    console.log(`Found ${allStyles.length} styles to update`);
    
    let updatedCount = 0;
    
    for (const style of allStyles) {
      const originalPrompt = style.prompt;
      const safePrompt = formatSafePrompt(originalPrompt);
      
      // Only update if the prompt actually changed
      if (safePrompt !== originalPrompt) {
        await db
          .update(cosplayStyles)
          .set({ prompt: safePrompt })
          .where(eq(cosplayStyles.styleId, style.styleId));
        
        console.log(`  ✓ Updated: ${style.styleId}`);
        console.log(`    Before: ${originalPrompt.substring(0, 80)}...`);
        console.log(`    After: ${safePrompt.substring(0, 80)}...`);
        updatedCount++;
      } else {
        console.log(`  - Skipped: ${style.styleId} (already safe)`);
      }
    }
    
    console.log(`\nSuccessfully updated ${updatedCount} out of ${allStyles.length} prompts!`);
    console.log('All prompts now use content-filter safe formatting while preserving character consistency.');
    
  } catch (error) {
    console.error('Error updating prompts:', error);
    throw error;
  }
}

// Import eq function
import { eq } from "drizzle-orm";

// Run the comprehensive safety update
fixAllPromptsSafety()
  .then(() => {
    console.log('Safety update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Safety update failed:', error);
    process.exit(1);
  });