/**
 * Comprehensive update of all style prompts for character consistency
 * Focus on costume, styling, and accessories while preserving facial features
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const characterConsistentPrompts = [
  // Anime Category
  {
    styleId: "anime-hero",
    prompt: "wearing a heroic anime-style costume with cape and armor details, spiky anime hair styled up, maintaining their facial features and natural identity"
  },
  {
    styleId: "magical-girl",
    prompt: "dressed in a colorful magical girl outfit with frilly skirt and ribbons, holding a magical wand, keeping their natural facial structure and expression"
  },
  {
    styleId: "ninja",
    prompt: "wearing traditional dark ninja clothing with lower face mask, ninja headband, preserving their eyes and upper facial features"
  },
  {
    styleId: "mecha-pilot",
    prompt: "wearing futuristic pilot suit with helmet visor up, high-tech clothing details, maintaining their facial identity"
  },
  {
    styleId: "demon-slayer",
    prompt: "wearing demon slayer corps uniform with haori jacket, katana at side, keeping their natural face and expression"
  },

  // Fantasy Category
  {
    styleId: "medieval-knight",
    prompt: "wearing shining medieval armor with helmet off, cape and sword, preserving their facial features and identity"
  },
  {
    styleId: "elven-archer",
    prompt: "wearing elven ranger clothing with bow and quiver, pointed ear accessories, maintaining their natural facial structure"
  },
  {
    styleId: "wizard",
    prompt: "wearing long wizard robes with pointed hat, holding staff, fake beard accessory if needed, keeping their face visible"
  },
  {
    styleId: "pirate-captain",
    prompt: "wearing pirate coat with tricorn hat, eye patch accessory, keeping their natural facial features and expression"
  },
  {
    styleId: "viking-warrior",
    prompt: "wearing viking armor with fur cloak, horned helmet, maintaining their facial identity and bone structure"
  },

  // Sci-Fi Category
  {
    styleId: "space-marine",
    prompt: "wearing futuristic space marine armor with helmet off, high-tech suit details, preserving their facial features"
  },
  {
    styleId: "cyberpunk-hacker",
    prompt: "wearing cyberpunk clothing with neon accessories, tech implant stickers, keeping their natural face and identity"
  },
  {
    styleId: "alien-diplomat",
    prompt: "wearing formal alien ambassador robes with subtle alien makeup accents, maintaining their human facial structure"
  },
  {
    styleId: "time-traveler",
    prompt: "wearing time travel gear with futuristic accessories, goggles on forehead, preserving their facial identity"
  },

  // Gaming Category
  {
    styleId: "fps-soldier",
    prompt: "wearing modern military gear with tactical vest, camouflage face paint, keeping their facial features recognizable"
  },
  {
    styleId: "mmorpg-paladin",
    prompt: "wearing ornate paladin armor with holy symbols, golden accents, helmet off to show their face"
  },
  {
    styleId: "battle-royale",
    prompt: "wearing tactical battle gear with utility belt, war paint markings, maintaining their natural identity"
  },

  // Sports Category
  {
    styleId: "michael-jordan",
    prompt: "wearing Chicago Bulls red basketball uniform number 23, in basketball pose with ball, maintaining their facial features and identity"
  },
  {
    styleId: "lebron-james",
    prompt: "wearing Lakers purple and gold uniform, athletic basketball stance, preserving their natural facial appearance"
  },
  {
    styleId: "kobe-bryant",
    prompt: "wearing Lakers purple uniform number 24, basketball pose, keeping their facial characteristics and expression"
  },
  {
    styleId: "stephen-curry",
    prompt: "wearing Warriors blue and gold uniform number 30, shooting pose, maintaining their facial identity"
  },
  {
    styleId: "cristiano-ronaldo",
    prompt: "wearing Real Madrid white soccer jersey number 7, soccer pose with ball, preserving their facial features"
  },
  {
    styleId: "lionel-messi",
    prompt: "wearing Barcelona blue and red jersey number 10, dribbling pose, keeping their natural face"
  },
  {
    styleId: "tom-brady",
    prompt: "wearing Patriots blue uniform number 12, quarterback throwing pose, maintaining their facial identity"
  },
  {
    styleId: "serena-williams",
    prompt: "wearing tennis outfit with racket, athletic pose on court, preserving their facial features"
  },
  {
    styleId: "usain-bolt",
    prompt: "wearing Jamaica track uniform, sprinting pose, maintaining their natural facial expression"
  },

  // Viral Memes Category - focus on expressions and accessories
  {
    styleId: "doge-meme",
    prompt: "making subtle doge expression with slight smile and raised eyebrows, wearing golden retriever ears as headpiece accessory"
  },
  {
    styleId: "pepe-frog-meme",
    prompt: "making pepe-style smirk expression, wearing green frog hat or face paint accents, keeping their human features"
  },
  {
    styleId: "surprised-pikachu",
    prompt: "making wide-eyed surprised expression, wearing yellow Pikachu ears and red cheek circle stickers"
  },
  {
    styleId: "stonks-meme",
    prompt: "wearing business suit with tie, confident expression, holding financial charts, maintaining their facial identity"
  },
  {
    styleId: "this-is-fine",
    prompt: "sitting calmly with slight smile, wearing casual clothing, flame effects in background, keeping their natural face"
  },
  {
    styleId: "distracted-boyfriend-meme",
    prompt: "making the classic looking back expression, wearing casual clothing, preserving their facial features"
  },
  {
    styleId: "drake-pointing-meme",
    prompt: "making pointing gesture with approval expression, wearing casual hoodie, maintaining their facial identity"
  },
  {
    styleId: "woman-yelling-cat",
    prompt: "making dramatic pointing expression, wearing casual clothing, keeping their natural facial features"
  },
  {
    styleId: "gigachad-viral",
    prompt: "making confident facial expression with slight smile, wearing casual clothing, maintaining their bone structure"
  },
  {
    styleId: "chad-vs-virgin",
    prompt: "making confident chad expression, wearing casual clothing, preserving their facial identity"
  },

  // Cosplay Category
  {
    styleId: "gojo-jujutsu",
    prompt: "wearing Satoru Gojo's black jujutsu uniform with high collar, stylish sunglasses, white hair wig, keeping their facial structure"
  },
  {
    styleId: "nezuko-demon",
    prompt: "wearing Nezuko's pink kimono, bamboo muzzle prop, pink hair ribbons, maintaining their natural facial features"
  },
  {
    styleId: "naruto-hokage",
    prompt: "wearing orange and black ninja outfit with headband, blonde spiky hair wig, preserving their face shape"
  },
  {
    styleId: "sailor-moon",
    prompt: "wearing sailor moon costume with tiara and gloves, blonde twin-tail wig, keeping their facial identity"
  },
  {
    styleId: "attack-titan",
    prompt: "wearing Survey Corps uniform with cape, ODM gear accessories, maintaining their human facial features"
  },

  // Historical Category
  {
    styleId: "roman-gladiator",
    prompt: "wearing gladiator armor with leather straps, holding sword and shield, preserving their facial features"
  },
  {
    styleId: "egyptian-pharaoh",
    prompt: "wearing pharaoh headdress and golden jewelry, royal Egyptian clothing, maintaining their facial identity"
  },
  {
    styleId: "samurai-warrior",
    prompt: "wearing traditional samurai armor with helmet off, katana at side, keeping their natural face"
  },
  {
    styleId: "viking-berserker",
    prompt: "wearing viking battle gear with fur cloak, war paint markings, preserving their facial structure"
  },

  // Horror Category
  {
    styleId: "vampire-gothic",
    prompt: "wearing gothic vampire clothing with cape, pale makeup, fake fangs, keeping their facial bone structure"
  },
  {
    styleId: "zombie-apocalypse",
    prompt: "wearing torn clothing with zombie makeup effects, maintaining their underlying facial features"
  },
  {
    styleId: "werewolf",
    prompt: "wearing torn clothing with werewolf makeup and fake fur accents, preserving their human facial identity"
  },

  // Superhero Category
  {
    styleId: "superman",
    prompt: "wearing Superman blue and red costume with cape, 'S' symbol on chest, maintaining their facial features"
  },
  {
    styleId: "batman",
    prompt: "wearing Batman black costume with utility belt, cowl mask covering upper face, preserving visible features"
  },
  {
    styleId: "wonder-woman",
    prompt: "wearing Wonder Woman armor with tiara and bracelets, keeping their natural facial identity"
  },
  {
    styleId: "spider-man",
    prompt: "wearing Spider-Man red and blue suit with mask off, web patterns, maintaining their facial features"
  }
];

async function updateAllPromptsForCharacterConsistency() {
  console.log('Updating all style prompts for character consistency...');
  console.log(`Total prompts to update: ${characterConsistentPrompts.length}`);
  
  try {
    for (const update of characterConsistentPrompts) {
      await db
        .update(cosplayStyles)
        .set({ prompt: update.prompt })
        .where(eq(cosplayStyles.styleId, update.styleId));
      
      console.log(`  ✓ Updated: ${update.styleId}`);
    }
    
    console.log('Successfully updated all prompts for character consistency!');
    console.log('All styles now focus on costume/styling while preserving facial identity.');
  } catch (error) {
    console.error('Error updating prompts:', error);
    throw error;
  }
}

// Run the comprehensive update
updateAllPromptsForCharacterConsistency().catch(console.error);