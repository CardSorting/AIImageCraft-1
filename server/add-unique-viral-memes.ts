/**
 * Add more unique viral memes and internet culture styles
 * Focusing on memes not currently in the collection
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const uniqueViralStyles = [
  {
    styleId: "uno-reverse-card",
    name: "Uno Reverse Card",
    description: "Ultimate comeback card meme",
    prompt: "uno reverse card meme, colorful card game, comeback energy, reverse psychology, card flip gesture",
    iconName: "RotateCcw"
  },
  {
    styleId: "bonk-go-to-horny-jail",
    name: "Bonk! Go to Horny Jail",
    description: "Dog with bat meme punishment",
    prompt: "bonk go to horny jail meme, dog with baseball bat, bonk gesture, internet justice, meme punishment",
    iconName: "Gavel"
  },
  {
    styleId: "moths-lamp",
    name: "Möth Loves Lämp",
    description: "Moth obsessed with lamp meme",
    prompt: "moth lamp meme, fluffy moth, obsession with light, lämp desire, moth attraction meme",
    iconName: "Lightbulb"
  },
  {
    styleId: "sike-you-thought",
    name: "Sike! You Thought",
    description: "Gotcha moment meme",
    prompt: "sike you thought meme, gotcha moment, surprise reveal, finger pointing, plot twist energy",
    iconName: "AlertTriangle"
  },
  {
    styleId: "change-my-mind",
    name: "Change My Mind",
    description: "Steven Crowder debate table meme",
    prompt: "change my mind meme, debate table setup, controversial opinion, crowder sitting, discussion invite",
    iconName: "MessageSquare"
  },
  {
    styleId: "bruh-moment",
    name: "Bruh Moment",
    description: "Disappointed reaction meme",
    prompt: "bruh moment meme, disappointed expression, facepalm energy, awkward situation, cringe reaction",
    iconName: "Frown"
  },
  {
    styleId: "okay-boomer",
    name: "OK Boomer",
    description: "Generational dismissal meme",
    prompt: "ok boomer meme, generational gap, dismissive attitude, young vs old, eye roll energy",
    iconName: "Clock"
  },
  {
    styleId: "karen-manager",
    name: "Karen Wants Manager",
    description: "Entitled customer meme",
    prompt: "karen wants manager meme, entitled customer, short blonde haircut, demanding attitude, retail nightmare",
    iconName: "UserX"
  },
  {
    styleId: "ohio-final-boss",
    name: "Ohio Final Boss",
    description: "Chaotic Ohio state meme",
    prompt: "ohio final boss meme, chaotic energy, surreal ohio vibes, bizarre state energy, gen z humor",
    iconName: "Zap"
  },
  {
    styleId: "vibe-check",
    name: "Vibe Check",
    description: "Energy assessment meme",
    prompt: "vibe check meme, energy assessment, mood evaluation, good vibes only, social media culture",
    iconName: "Heart"
  },
  {
    styleId: "poggers",
    name: "Poggers",
    description: "Excited gaming reaction",
    prompt: "poggers meme, excited gaming reaction, twitch culture, hype energy, gaming celebration",
    iconName: "Gamepad2"
  },
  {
    styleId: "monke",
    name: "Return to Monke",
    description: "Reject modernity embrace monkey",
    prompt: "return to monke meme, reject modernity, embrace monkey, primitive lifestyle, ape together strong",
    iconName: "Trees"
  },
  {
    styleId: "amogus",
    name: "Amogus",
    description: "Sus among us distortion",
    prompt: "amogus meme, sus energy, among us distortion, suspicious behavior, impostor vibes",
    iconName: "Users"
  },
  {
    styleId: "sheesh",
    name: "Sheesh",
    description: "Gen Z approval expression",
    prompt: "sheesh meme, gen z approval, impressed reaction, finger guns, respectful acknowledgment",
    iconName: "ThumbsUp"
  },
  {
    styleId: "no-cap",
    name: "No Cap",
    description: "No lies truth telling",
    prompt: "no cap meme, truth telling, honest statement, gen z slang, authentic energy",
    iconName: "Check"
  },
  {
    styleId: "its-giving",
    name: "It's Giving",
    description: "Vibe description meme",
    prompt: "its giving meme, vibe description, aesthetic energy, trend analysis, social media commentary",
    iconName: "Sparkles"
  },
  {
    styleId: "slay-queen",
    name: "Slay Queen",
    description: "Confident empowerment meme",
    prompt: "slay queen meme, confident empowerment, fierce energy, boss attitude, self-love vibes",
    iconName: "Crown"
  },
  {
    styleId: "im-baby",
    name: "I'm Baby",
    description: "Wholesome innocent meme",
    prompt: "im baby meme, wholesome innocent energy, soft aesthetic, protected energy, gentle vibes",
    iconName: "Baby"
  },
  {
    styleId: "ight-imma-head-out",
    name: "Aight Imma Head Out",
    description: "SpongeBob leaving meme",
    prompt: "aight imma head out meme, spongebob leaving, awkward exit, social situation escape, departure energy",
    iconName: "LogOut"
  },
  {
    styleId: "nobody-literally-nobody",
    name: "Nobody: Literally Nobody:",
    description: "Unprompted action meme format",
    prompt: "nobody literally nobody meme, unprompted action, random behavior, twitter format, social observation",
    iconName: "MessageCircle"
  }
];

async function addUniqueViralMemes() {
  console.log('Adding unique viral memes styles...');
  
  try {
    for (const style of uniqueViralStyles) {
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
        console.log(`  Added unique viral meme: ${style.name}`);
      } else {
        console.log(`  ${style.name} already exists, skipping...`);
      }
    }
    
    console.log('Successfully added unique viral memes!');
  } catch (error) {
    console.error('Error adding unique viral memes:', error);
    throw error;
  }
}

// Run the expansion
addUniqueViralMemes().catch(console.error);