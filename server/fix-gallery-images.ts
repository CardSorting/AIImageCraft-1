/**
 * Fix Gallery Images Script
 * Convert existing base64 image URLs to proper hosted URLs using FAL storage
 */

import { fal } from "@fal-ai/client";
import { db } from "./db";
import { generatedImages } from "../shared/schema";
import { eq } from "drizzle-orm";

// Configure FAL AI client
const apiKey = process.env.FAL_KEY;
if (!apiKey) {
  throw new Error("FAL_KEY environment variable is required");
}

fal.config({
  credentials: apiKey,
});

async function convertBase64ToUrl(base64DataUri: string): Promise<string> {
  console.log(`Converting base64 image to hosted URL...`);
  
  try {
    // Extract base64 data from data URI
    const base64Data = base64DataUri.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    
    // Upload to FAL storage
    const hostedUrl = await fal.storage.upload(blob);
    console.log(`Successfully converted to hosted URL: ${hostedUrl.substring(0, 50)}...`);
    
    return hostedUrl;
  } catch (error) {
    console.error(`Failed to convert base64 to hosted URL:`, error);
    throw error;
  }
}

async function fixGalleryImages() {
  console.log(`Starting gallery images conversion...`);
  
  try {
    // Get all images with base64 URLs
    const images = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.imageUrl, generatedImages.imageUrl)) // Get all images
      .limit(100);
    
    console.log(`Found ${images.length} images to process`);
    
    let converted = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const image of images) {
      try {
        // Check if image URL is base64
        if (image.imageUrl && image.imageUrl.startsWith('data:')) {
          console.log(`Converting image ${image.id}...`);
          
          // Convert to hosted URL
          const hostedUrl = await convertBase64ToUrl(image.imageUrl);
          
          // Update database
          await db
            .update(generatedImages)
            .set({ imageUrl: hostedUrl })
            .where(eq(generatedImages.id, image.id));
          
          converted++;
          console.log(`✓ Converted image ${image.id}`);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          skipped++;
          console.log(`- Skipped image ${image.id} (already has proper URL)`);
        }
      } catch (error) {
        failed++;
        console.error(`✗ Failed to convert image ${image.id}:`, error);
      }
    }
    
    console.log(`\nConversion completed:`);
    console.log(`- Converted: ${converted} images`);
    console.log(`- Skipped: ${skipped} images`);
    console.log(`- Failed: ${failed} images`);
    
  } catch (error) {
    console.error(`Gallery images conversion failed:`, error);
    throw error;
  }
}

// Run the conversion
fixGalleryImages()
  .then(() => {
    console.log(`Gallery images conversion completed successfully`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`Gallery images conversion failed:`, error);
    process.exit(1);
  });

export { fixGalleryImages };