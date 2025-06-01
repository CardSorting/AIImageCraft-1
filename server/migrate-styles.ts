/**
 * Migration script to move hardcoded styles to database
 * Resolves the issue of styles being hardcoded in the frontend
 */

import { db } from "./db";
import { styleCategories, cosplayStyles } from "@shared/schema";
import { COSPLAY_STYLE_LIBRARY } from "@shared/cosplayStyles";
import { eq } from "drizzle-orm";

async function migrateStylesToDatabase() {
  console.log('Starting style migration...');
  
  try {
    // First, check if data already exists
    const existingCategories = await db.select().from(styleCategories).limit(1);
    if (existingCategories.length > 0) {
      console.log('Styles already migrated to database.');
      return;
    }

    console.log('Migrating style categories...');
    
    // Migrate categories
    for (const category of COSPLAY_STYLE_LIBRARY) {
      console.log(`Migrating category: ${category.name}`);
      
      await db.insert(styleCategories).values({
        categoryId: category.id,
        name: category.name,
        shortName: category.shortName,
        description: category.description,
        iconName: extractIconName(category.icon),
        featured: category.featured ? 1 : 0,
        color: category.color || null,
      });

      // Migrate styles for this category
      console.log(`Migrating ${category.styles.length} styles for ${category.name}...`);
      
      for (const style of category.styles) {
        await db.insert(cosplayStyles).values({
          styleId: style.id,
          categoryId: category.id,
          name: style.name,
          description: style.description,
          prompt: style.prompt,
          negativePrompt: style.negativePrompt || null,
          iconName: extractIconName(style.icon),
          previewImage: style.previewImage || null,
          difficulty: style.difficulty || 'medium',
          premium: style.premium ? 1 : 0,
          popular: style.popular ? 1 : 0,
          popularity: style.popular ? '0.9' : (Math.random() * 0.7 + 0.1).toFixed(2),
          tags: style.tags || [],
          usageCount: 0,
        });
      }
    }

    console.log('Style migration completed successfully!');
    
    // Verify migration
    const categoryCount = await db.select().from(styleCategories);
    const styleCount = await db.select().from(cosplayStyles);
    
    console.log(`Migrated ${categoryCount.length} categories and ${styleCount.length} styles.`);
    
  } catch (error) {
    console.error('Error during style migration:', error);
    throw error;
  }
}

function extractIconName(iconComponent: any): string {
  // Extract icon name from Lucide React component
  if (iconComponent && iconComponent.displayName) {
    return iconComponent.displayName;
  }
  
  // Fallback mapping for common icons
  const iconString = iconComponent?.toString() || '';
  if (iconString.includes('Crown')) return 'Crown';
  if (iconString.includes('Star')) return 'Star';
  if (iconString.includes('Wand')) return 'Wand2';
  if (iconString.includes('Sparkles')) return 'Sparkles';
  if (iconString.includes('Sword')) return 'Sword';
  if (iconString.includes('Shield')) return 'Shield';
  if (iconString.includes('Zap')) return 'Zap';
  if (iconString.includes('Heart')) return 'Heart';
  if (iconString.includes('Music')) return 'Music';
  if (iconString.includes('Palette')) return 'Palette';
  if (iconString.includes('Camera')) return 'Camera';
  if (iconString.includes('Gamepad')) return 'Gamepad2';
  if (iconString.includes('Headphones')) return 'Headphones';
  if (iconString.includes('Rocket')) return 'Rocket';
  if (iconString.includes('Atom')) return 'Atom';
  if (iconString.includes('Microscope')) return 'Microscope';
  if (iconString.includes('Stethoscope')) return 'Stethoscope';
  if (iconString.includes('Briefcase')) return 'Briefcase';
  if (iconString.includes('TreePine')) return 'TreePine';
  if (iconString.includes('Mountain')) return 'Mountain';
  if (iconString.includes('Waves')) return 'Waves';
  if (iconString.includes('Sun')) return 'Sun';
  if (iconString.includes('Moon')) return 'Moon';
  if (iconString.includes('CloudRain')) return 'CloudRain';
  
  return 'Star'; // Default fallback
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateStylesToDatabase()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateStylesToDatabase };