/**
 * Add final batch of unique viral memes and internet culture styles
 * Focusing on platform-specific and era-specific memes not yet covered
 */

import { db } from "./db";
import { cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const finalViralStyles = [
  {
    styleId: "me-explaining-to-my-mom",
    name: "Me Explaining to My Mom",
    description: "Charlie Day conspiracy theory meme",
    prompt: "me explaining to my mom meme, charlie day conspiracy theory, string board, frantic explanation, always sunny",
    iconName: "MessageSquare"
  },
  {
    styleId: "this-you",
    name: "This You?",
    description: "Twitter accountability meme",
    prompt: "this you meme, twitter accountability, old tweet exposure, social media callout, receipt energy",
    iconName: "FileText"
  },
  {
    styleId: "ratio",
    name: "Ratio",
    description: "Twitter engagement competition",
    prompt: "ratio meme, twitter engagement battle, reply dominance, social media competition, viral response",
    iconName: "TrendingUp"
  },
  {
    styleId: "based",
    name: "Based",
    description: "Authentic opinion approval",
    prompt: "based meme, authentic opinion, controversial truth, unapologetic stance, internet approval",
    iconName: "Shield"
  },
  {
    styleId: "red-pill-blue-pill",
    name: "Red Pill Blue Pill",
    description: "Matrix choice meme",
    prompt: "red pill blue pill meme, matrix choice, morpheus offering pills, difficult decision, truth vs comfort",
    iconName: "Pill"
  },
  {
    styleId: "say-the-line-bart",
    name: "Say the Line Bart",
    description: "Simpsons catchphrase demand",
    prompt: "say the line bart meme, simpsons audience demand, expected catchphrase, crowd pressure, classic quote",
    iconName: "MessageCircle"
  },
  {
    styleId: "tuxedo-winnie-pooh",
    name: "Tuxedo Winnie the Pooh",
    description: "Fancy vs normal comparison",
    prompt: "tuxedo winnie the pooh meme, fancy vs normal, sophisticated comparison, classy upgrade, preference meme",
    iconName: "Crown"
  },
  {
    styleId: "patrick-wallet",
    name: "Patrick's Wallet",
    description: "SpongeBob ID check meme",
    prompt: "patrick wallet meme, spongebob id check, man ray pointing, obvious truth, denial meme",
    iconName: "Wallet"
  },
  {
    styleId: "cereal-guy",
    name: "Cereal Guy",
    description: "Spitting out cereal reaction",
    prompt: "cereal guy meme, spitting out cereal, shocked reaction, breakfast surprise, classic rage comic",
    iconName: "Coffee"
  },
  {
    styleId: "forever-alone",
    name: "Forever Alone",
    description: "Lonely sad face meme",
    prompt: "forever alone meme, sad lonely face, isolation feels, single life, melancholy expression",
    iconName: "User"
  },
  {
    styleId: "y-u-no",
    name: "Y U NO",
    description: "Frustrated demand meme",
    prompt: "y u no meme, frustrated demand, angry questioning, broken english, classic rage comic",
    iconName: "HelpCircle"
  },
  {
    styleId: "me-gusta",
    name: "Me Gusta",
    description: "Creepy satisfaction face",
    prompt: "me gusta meme, creepy satisfaction face, disturbing smile, weird pleasure, rage comic classic",
    iconName: "Smile"
  },
  {
    styleId: "trollface",
    name: "Trollface",
    description: "Classic internet troll",
    prompt: "trollface meme, classic internet troll, mischievous grin, problem officer, rage comic icon",
    iconName: "Smile"
  },
  {
    styleId: "fuuuu",
    name: "FUUUU",
    description: "Rage comic frustration",
    prompt: "fuuuu meme, rage comic frustration, extreme anger, hair pulling, classic internet rage",
    iconName: "Angry"
  },
  {
    styleId: "shut-up-and-take-my-money",
    name: "Shut Up and Take My Money",
    description: "Futurama eager purchase",
    prompt: "shut up and take my money meme, futurama fry, eager purchase, throwing money, instant buy",
    iconName: "DollarSign"
  },
  {
    styleId: "not-sure-if",
    name: "Not Sure If",
    description: "Futurama suspicious squint",
    prompt: "not sure if meme, futurama fry squinting, suspicious expression, uncertain feeling, skeptical look",
    iconName: "Eye"
  },
  {
    styleId: "one-does-not-simply",
    name: "One Does Not Simply",
    description: "Lord of the Rings Boromir",
    prompt: "one does not simply meme, boromir lord of the rings, epic declaration, serious warning, fantasy wisdom",
    iconName: "Shield"
  },
  {
    styleId: "brace-yourselves",
    name: "Brace Yourselves",
    description: "Game of Thrones Ned Stark",
    prompt: "brace yourselves meme, ned stark game of thrones, winter is coming, serious warning, impending doom",
    iconName: "Shield"
  },
  {
    styleId: "good-guy-greg",
    name: "Good Guy Greg",
    description: "Helpful nice person meme",
    prompt: "good guy greg meme, helpful nice person, marijuana leaf hat, good deed energy, positive vibes",
    iconName: "Heart"
  },
  {
    styleId: "scumbag-brain",
    name: "Scumbag Brain",
    description: "Self-sabotaging thoughts",
    prompt: "scumbag brain meme, self-sabotaging thoughts, brain with hat, internal conflict, mental struggles",
    iconName: "Brain"
  }
];

async function addFinalViralMemes() {
  console.log('Adding final batch of unique viral memes...');
  
  try {
    for (const style of finalViralStyles) {
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
        console.log(`  Added final viral meme: ${style.name}`);
      } else {
        console.log(`  ${style.name} already exists, skipping...`);
      }
    }
    
    console.log('Successfully added final viral memes batch!');
  } catch (error) {
    console.error('Error adding final viral memes:', error);
    throw error;
  }
}

// Run the final expansion
addFinalViralMemes().catch(console.error);