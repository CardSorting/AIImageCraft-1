/**
 * Add even more viral memes and internet culture styles
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const moreViralStyles = [
  {
    styleId: "salt-bae",
    name: "Salt Bae",
    description: "Dramatic salt sprinkling chef",
    prompt: "salt bae meme, dramatic salt sprinkling, chef pose, sunglasses, viral cooking gesture, turkish chef aesthetic",
    iconName: "ChefHat"
  },
  {
    styleId: "big-chungus",
    name: "Big Chungus",
    description: "Chunky Bugs Bunny meme",
    prompt: "big chungus meme, chunky bugs bunny, fat rabbit, cartoon character, internet meme culture",
    iconName: "Rabbit"
  },
  {
    styleId: "coffin-dance",
    name: "Coffin Dance",
    description: "Ghanaian funeral dance meme",
    prompt: "coffin dance meme, ghanaian funeral dancers, colorful suits, dancing pallbearers, viral dance",
    iconName: "Music"
  },
  {
    styleId: "overly-attached-girlfriend",
    name: "Overly Attached Girlfriend",
    description: "Creepy smile girlfriend meme",
    prompt: "overly attached girlfriend meme, creepy smile, wide eyes, possessive expression, viral girlfriend",
    iconName: "Eye"
  },
  {
    styleId: "hide-the-pain-harold",
    name: "Hide the Pain Harold",
    description: "Forced smile stock photo man",
    prompt: "hide the pain harold meme, forced smile, awkward expression, stock photo man, internal suffering",
    iconName: "Smile"
  },
  {
    styleId: "left-exit-12",
    name: "Left Exit 12 Off Ramp",
    description: "Car swerving highway meme",
    prompt: "left exit 12 off ramp meme, car swerving, highway decision, last minute choice, viral decision meme",
    iconName: "Car"
  },
  {
    styleId: "expanding-brain",
    name: "Expanding Brain",
    description: "Increasingly enlightened brain levels",
    prompt: "expanding brain meme, four panel progression, increasing intelligence, glowing brain, meme template",
    iconName: "Brain"
  },
  {
    styleId: "philosoraptor",
    name: "Philosoraptor",
    description: "Thoughtful dinosaur philosopher",
    prompt: "philosoraptor meme, thinking dinosaur, philosophical velociraptor, deep thoughts, contemplative pose",
    iconName: "MessageCircle"
  },
  {
    styleId: "bad-luck-brian",
    name: "Bad Luck Brian",
    description: "Unlucky braces kid",
    prompt: "bad luck brian meme, awkward yearbook photo, braces, unfortunate situations, unlucky kid",
    iconName: "Frown"
  },
  {
    styleId: "scumbag-steve",
    name: "Scumbag Steve",
    description: "Sideways hat troublemaker",
    prompt: "scumbag steve meme, sideways cap, troublemaker aesthetic, bad friend behavior, internet villain",
    iconName: "User"
  },
  {
    styleId: "first-world-problems",
    name: "First World Problems",
    description: "Privileged person crying meme",
    prompt: "first world problems meme, crying woman, privileged complaints, luxury problems, entitled expression",
    iconName: "Droplets"
  },
  {
    styleId: "roll-safe",
    name: "Roll Safe",
    description: "Pointing at head thinking meme",
    prompt: "roll safe meme, pointing at head, smart thinking gesture, black man tapping temple, clever idea",
    iconName: "Brain"
  },
  {
    styleId: "arthur-fist",
    name: "Arthur Fist",
    description: "Clenched fist frustration",
    prompt: "arthur fist meme, clenched fist, frustrated cartoon character, angry gesture, childhood show meme",
    iconName: "Zap"
  },
  {
    styleId: "mocking-spongebob",
    name: "Mocking SpongeBob",
    description: "Alternating caps sarcasm",
    prompt: "mocking spongebob meme, bent over spongebob, sarcastic pose, alternating caps text, mocking gesture",
    iconName: "MessageSquare"
  },
  {
    styleId: "gru-plan",
    name: "Gru's Plan",
    description: "Despicable Me presentation gone wrong",
    prompt: "gru's plan meme, despicable me presentation, three panel progression, plan backfire, minion movie",
    iconName: "FileText"
  },
  {
    styleId: "always-has-been",
    name: "Always Has Been",
    description: "Astronaut betrayal space meme",
    prompt: "always has been meme, astronaut pointing gun, space betrayal, earth from space, astronaut suit",
    iconName: "Globe"
  }
];

async function addMoreViralMemes() {
  console.log('Adding even more viral memes styles...');
  
  try {
    for (const style of moreViralStyles) {
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
    
    console.log('Successfully added more viral memes!');
  } catch (error) {
    console.error('Error adding viral memes:', error);
    throw error;
  }
}

// Run the expansion
addMoreViralMemes().catch(console.error);