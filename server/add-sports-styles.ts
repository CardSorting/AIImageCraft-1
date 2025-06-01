/**
 * Add comprehensive sports and athletes styles
 * Covering legendary athletes, sports aesthetics, and iconic moments
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const sportsStyles = [
  // Basketball Legends
  {
    styleId: "michael-jordan",
    name: "Michael Jordan",
    description: "His Airness basketball legend style",
    prompt: "michael jordan basketball legend, chicago bulls uniform, iconic jumpman pose, basketball court, athletic greatness",
    iconName: "Trophy"
  },
  {
    styleId: "lebron-james",
    name: "LeBron James",
    description: "The King basketball superstar",
    prompt: "lebron james basketball king, lakers uniform, powerful athletic build, championship energy, court dominance",
    iconName: "Crown"
  },
  {
    styleId: "kobe-bryant",
    name: "Kobe Bryant",
    description: "Black Mamba basketball icon",
    prompt: "kobe bryant black mamba, lakers purple and gold, fierce competitive spirit, mamba mentality, basketball greatness",
    iconName: "Zap"
  },
  {
    styleId: "stephen-curry",
    name: "Stephen Curry",
    description: "Golden State Warriors sharpshooter",
    prompt: "stephen curry three point shooter, warriors blue and gold, basketball precision, splash brothers energy",
    iconName: "Target"
  },

  // Football Legends
  {
    styleId: "tom-brady",
    name: "Tom Brady",
    description: "NFL GOAT quarterback",
    prompt: "tom brady quarterback legend, patriots uniform, football leadership, super bowl champion energy",
    iconName: "Shield"
  },
  {
    styleId: "joe-montana",
    name: "Joe Montana",
    description: "49ers quarterback legend",
    prompt: "joe montana quarterback cool, san francisco 49ers red and gold, clutch performance, football precision",
    iconName: "Star"
  },
  {
    styleId: "jerry-rice",
    name: "Jerry Rice",
    description: "Greatest wide receiver ever",
    prompt: "jerry rice wide receiver, 49ers uniform, incredible hands, route running perfection, football excellence",
    iconName: "Zap"
  },

  // Soccer Icons
  {
    styleId: "cristiano-ronaldo",
    name: "Cristiano Ronaldo",
    description: "CR7 soccer superstar",
    prompt: "cristiano ronaldo cr7, real madrid white jersey, athletic physique, soccer skill, siuu celebration",
    iconName: "Star"
  },
  {
    styleId: "lionel-messi",
    name: "Lionel Messi",
    description: "Argentine soccer magician",
    prompt: "lionel messi soccer genius, barcelona blue and red, dribbling magic, world cup champion, goat energy",
    iconName: "Crown"
  },
  {
    styleId: "pele",
    name: "Pelé",
    description: "Brazilian soccer legend",
    prompt: "pele brazilian soccer king, yellow brazil jersey, samba soccer style, world cup legend, jogo bonito",
    iconName: "Trophy"
  },

  // Tennis Champions
  {
    styleId: "serena-williams",
    name: "Serena Williams",
    description: "Tennis queen and champion",
    prompt: "serena williams tennis champion, powerful serve, athletic dominance, wimbledon champion, tennis greatness",
    iconName: "Crown"
  },
  {
    styleId: "roger-federer",
    name: "Roger Federer",
    description: "Swiss tennis maestro",
    prompt: "roger federer tennis elegance, swiss precision, graceful movement, wimbledon grass court, tennis artistry",
    iconName: "Star"
  },

  // Baseball Icons
  {
    styleId: "babe-ruth",
    name: "Babe Ruth",
    description: "The Sultan of Swat",
    prompt: "babe ruth baseball legend, yankees pinstripes, home run king, vintage baseball era, legendary swing",
    iconName: "Trophy"
  },
  {
    styleId: "derek-jeter",
    name: "Derek Jeter",
    description: "Yankees captain and clutch performer",
    prompt: "derek jeter yankees captain, pinstripe uniform, clutch hitting, world series champion, baseball leadership",
    iconName: "Shield"
  },

  // Hockey Legends
  {
    styleId: "wayne-gretzky",
    name: "Wayne Gretzky",
    description: "The Great One hockey legend",
    prompt: "wayne gretzky hockey great one, edmonton oilers uniform, ice hockey mastery, assist king, hockey intelligence",
    iconName: "Crown"
  },

  // Olympic Champions
  {
    styleId: "usain-bolt",
    name: "Usain Bolt",
    description: "Fastest man alive sprinter",
    prompt: "usain bolt lightning bolt pose, jamaican track uniform, olympic sprint champion, world record speed",
    iconName: "Zap"
  },
  {
    styleId: "michael-phelps",
    name: "Michael Phelps",
    description: "Olympic swimming GOAT",
    prompt: "michael phelps swimming champion, usa olympic team suit, pool dominance, 23 gold medals, aquatic excellence",
    iconName: "Trophy"
  },
  {
    styleId: "simone-biles",
    name: "Simone Biles",
    description: "Gymnastics GOAT",
    prompt: "simone biles gymnastics champion, usa team leotard, incredible athleticism, olympic gold medalist, gymnastics power",
    iconName: "Star"
  },

  // Boxing Champions
  {
    styleId: "muhammad-ali",
    name: "Muhammad Ali",
    description: "The Greatest boxer",
    prompt: "muhammad ali the greatest, boxing champion, float like butterfly sting like bee, heavyweight title, boxing legend",
    iconName: "Trophy"
  },
  {
    styleId: "mike-tyson",
    name: "Mike Tyson",
    description: "Iron Mike heavyweight champion",
    prompt: "mike tyson iron mike, black boxing trunks, fierce intensity, heavyweight knockout power, boxing intimidation",
    iconName: "Zap"
  },

  // Sports Aesthetics
  {
    styleId: "athletic-prep",
    name: "Athletic Prep Style",
    description: "Classic sporty preppy aesthetic",
    prompt: "athletic prep style, polo shirts, tennis skirts, country club vibes, clean sporty fashion, preppy athlete",
    iconName: "Shirt"
  },
  {
    styleId: "retro-sportswear",
    name: "Retro Sportswear",
    description: "Vintage 80s-90s athletic fashion",
    prompt: "retro sportswear 80s 90s, neon windbreakers, vintage sneakers, athletic nostalgia, old school sports fashion",
    iconName: "Clock"
  },
  {
    styleId: "olympic-champion",
    name: "Olympic Champion",
    description: "Podium winner with gold medal",
    prompt: "olympic champion on podium, gold medal ceremony, national anthem, athletic achievement, olympic victory",
    iconName: "Medal"
  },
  {
    styleId: "sports-commentator",
    name: "Sports Commentator",
    description: "Professional sports broadcaster style",
    prompt: "sports commentator broadcaster, professional suit, microphone, sports desk, television personality, game analysis",
    iconName: "Mic"
  }
];

async function addSportsStyles() {
  console.log('Adding sports and athletes styles...');
  
  try {
    for (const style of sportsStyles) {
      const existingStyle = await db
        .select()
        .from(cosplayStyles)
        .where(eq(cosplayStyles.styleId, style.styleId))
        .limit(1);
      
      if (existingStyle.length === 0) {
        await db.insert(cosplayStyles).values({
          styleId: style.styleId,
          categoryId: 'sports',
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
        console.log(`  Added sports style: ${style.name}`);
      } else {
        console.log(`  ${style.name} already exists, skipping...`);
      }
    }
    
    console.log('Successfully added sports and athletes styles!');
  } catch (error) {
    console.error('Error adding sports styles:', error);
    throw error;
  }
}

// Run the sports addition
addSportsStyles().catch(console.error);