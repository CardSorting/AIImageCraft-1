/**
 * Add trendy pop culture, meme, and viral content categories
 * Focus on current trends, viral memes, and popular culture references
 */

import { db } from "./db";
import { styleCategories, cosplayStyles } from "@shared/schema";
import { eq } from "drizzle-orm";

const trendyCategories = [
  {
    categoryId: "viral-memes",
    name: "Viral Memes & Internet Culture",
    shortName: "Viral",
    description: "Transform into the most iconic memes and viral internet sensations",
    iconName: "Zap",
    mainCategory: "entertainment",
    featured: true,
    color: "purple",
    styles: [
      {
        styleId: "gigachad",
        name: "Gigachad",
        description: "The ultimate alpha male meme aesthetic",
        prompt: "gigachad, extremely muscular man, black and white filter, dramatic lighting, confident pose, meme aesthetic, viral internet culture",
        iconName: "User"
      },
      {
        styleId: "wojak",
        name: "Wojak",
        description: "Classic internet meme character",
        prompt: "wojak character, simple drawn style, expressive face, meme culture, internet art style",
        iconName: "MessageCircle"
      },
      {
        styleId: "pepe-frog",
        name: "Pepe the Frog",
        description: "Iconic meme frog character",
        prompt: "pepe the frog, green frog character, meme style, internet culture, expressive cartoon",
        iconName: "Smile"
      },
      {
        styleId: "distracted-boyfriend",
        name: "Distracted Boyfriend",
        description: "Famous meme template aesthetic",
        prompt: "distracted boyfriend meme style, dramatic pointing, relationship drama, stock photo aesthetic, viral meme",
        iconName: "Eye"
      },
      {
        styleId: "drake-pointing",
        name: "Drake Pointing",
        description: "Drake approval/disapproval meme style",
        prompt: "drake pointing meme style, approval gesture, hip hop aesthetic, meme template, viral culture",
        iconName: "ThumbsUp"
      }
    ]
  },
  {
    categoryId: "tiktok-trends",
    name: "TikTok Trends & Aesthetics",
    shortName: "TikTok",
    description: "Latest TikTok viral trends and popular aesthetics",
    iconName: "Music",
    mainCategory: "entertainment",
    featured: true,
    color: "pink",
    styles: [
      {
        styleId: "core-girl",
        name: "That Girl/Core Girl",
        description: "Clean girl aesthetic with organized lifestyle vibes",
        prompt: "that girl aesthetic, clean girl makeup, organized lifestyle, minimalist fashion, healthy glow, productive morning routine",
        iconName: "Sparkles"
      },
      {
        styleId: "y2k-revival",
        name: "Y2K Revival",
        description: "Early 2000s nostalgic fashion comeback",
        prompt: "y2k fashion, early 2000s aesthetic, metallic clothing, chunky highlights, low rise jeans, nostalgic style",
        iconName: "Star"
      },
      {
        styleId: "cottagecore",
        name: "Cottagecore",
        description: "Rural romanticized lifestyle aesthetic",
        prompt: "cottagecore aesthetic, rural lifestyle, vintage floral dresses, countryside vibes, romantic pastoral style",
        iconName: "Flower"
      },
      {
        styleId: "dark-academia",
        name: "Dark Academia",
        description: "Scholarly gothic aesthetic with vintage books",
        prompt: "dark academia aesthetic, vintage scholarly style, gothic architecture, old books, tweed clothing, intellectual vibes",
        iconName: "Book"
      },
      {
        styleId: "coastal-grandmother",
        name: "Coastal Grandmother",
        description: "Relaxed beach house luxury aesthetic",
        prompt: "coastal grandmother aesthetic, linen clothing, beach house vibes, nautical style, relaxed luxury, seaside comfort",
        iconName: "Waves"
      }
    ]
  },
  {
    categoryId: "gaming-culture",
    name: "Gaming Culture & Esports",
    shortName: "Gaming",
    description: "Popular gaming characters and esports culture",
    iconName: "Gamepad2",
    mainCategory: "entertainment",
    featured: false,
    color: "blue",
    styles: [
      {
        styleId: "valorant-agent",
        name: "Valorant Agent",
        description: "Tactical shooter game character style",
        prompt: "valorant agent style, tactical gear, futuristic weapons, competitive gaming aesthetic, esports uniform",
        iconName: "Target"
      },
      {
        styleId: "among-us-crewmate",
        name: "Among Us Crewmate",
        description: "Iconic space bean character",
        prompt: "among us crewmate, colorful space suit, simple geometric design, viral game character, minimalist style",
        iconName: "Users"
      },
      {
        styleId: "minecraft-steve",
        name: "Minecraft Steve",
        description: "Blocky pixelated character aesthetic",
        prompt: "minecraft steve style, pixelated blocks, cubic design, sandbox game aesthetic, retro pixel art",
        iconName: "Square"
      },
      {
        styleId: "fortnite-skin",
        name: "Fortnite Skin",
        description: "Colorful battle royale character style",
        prompt: "fortnite character skin, vibrant colors, battle royale gear, gaming outfit, competitive style",
        iconName: "Zap"
      }
    ]
  },
  {
    categoryId: "netflix-shows",
    name: "Netflix & Streaming Culture",
    shortName: "Streaming",
    description: "Popular streaming show characters and aesthetics",
    iconName: "Tv",
    mainCategory: "entertainment",
    featured: false,
    color: "red",
    styles: [
      {
        styleId: "stranger-things",
        name: "Stranger Things 80s",
        description: "Retro 80s supernatural thriller aesthetic",
        prompt: "stranger things 80s style, retro fashion, supernatural vibes, nostalgic 1980s aesthetic, sci-fi horror",
        iconName: "Flashlight"
      },
      {
        styleId: "squid-game",
        name: "Squid Game",
        description: "Korean survival drama aesthetic",
        prompt: "squid game style, korean survival game, dystopian uniform, competitive tension, viral series aesthetic",
        iconName: "Users"
      },
      {
        styleId: "bridgerton",
        name: "Bridgerton Regency",
        description: "Regency era romance drama style",
        prompt: "bridgerton regency style, period drama fashion, elegant ballgowns, romantic historical aesthetic",
        iconName: "Crown"
      },
      {
        styleId: "euphoria-makeup",
        name: "Euphoria Makeup",
        description: "Bold colorful experimental makeup looks",
        prompt: "euphoria makeup style, bold colorful eyeshadow, experimental beauty, artistic face gems, dramatic teen style",
        iconName: "Palette"
      }
    ]
  },
  {
    categoryId: "social-media",
    name: "Social Media Influencer",
    shortName: "Influencer",
    description: "Popular social media and influencer aesthetics",
    iconName: "Camera",
    mainCategory: "lifestyle",
    featured: false,
    color: "orange",
    styles: [
      {
        styleId: "instagram-baddie",
        name: "Instagram Baddie",
        description: "Glamorous social media influencer look",
        prompt: "instagram baddie style, glamorous makeup, contoured face, luxury fashion, social media influencer aesthetic",
        iconName: "Instagram"
      },
      {
        styleId: "pinterest-girl",
        name: "Pinterest Girl",
        description: "Aesthetic Pinterest-worthy styling",
        prompt: "pinterest girl aesthetic, curated style, aesthetic outfits, pinterest-worthy poses, trendy fashion",
        iconName: "Image"
      },
      {
        styleId: "youtube-creator",
        name: "YouTube Creator",
        description: "Content creator casual professional style",
        prompt: "youtube creator style, casual professional look, content creator aesthetic, approachable fashion",
        iconName: "Play"
      },
      {
        styleId: "linkedin-influencer",
        name: "LinkedIn Influencer",
        description: "Professional networking platform style",
        prompt: "linkedin influencer style, professional business casual, networking event fashion, corporate influence",
        iconName: "Briefcase"
      }
    ]
  },
  {
    categoryId: "crypto-nft",
    name: "Crypto & NFT Culture",
    shortName: "Crypto",
    description: "Digital currency and NFT community aesthetics",
    iconName: "Coins",
    mainCategory: "professional",
    featured: false,
    color: "yellow",
    styles: [
      {
        styleId: "bitcoin-maximalist",
        name: "Bitcoin Maximalist",
        description: "Cryptocurrency enthusiast aesthetic",
        prompt: "bitcoin maximalist style, crypto culture fashion, digital currency aesthetic, tech entrepreneur look",
        iconName: "TrendingUp"
      },
      {
        styleId: "nft-collector",
        name: "NFT Collector",
        description: "Digital art collector aesthetic",
        prompt: "nft collector style, digital art culture, blockchain fashion, crypto art enthusiast aesthetic",
        iconName: "Image"
      },
      {
        styleId: "defi-trader",
        name: "DeFi Trader",
        description: "Decentralized finance trader look",
        prompt: "defi trader style, financial technology aesthetic, crypto trading culture, digital finance professional",
        iconName: "BarChart"
      }
    ]
  }
];

async function addTrendyStyles() {
  console.log('Adding trendy pop culture categories and styles...');
  
  try {
    for (const category of trendyCategories) {
      console.log(`Adding category: ${category.name}`);
      
      // Check if category already exists
      const existingCategory = await db
        .select()
        .from(styleCategories)
        .where(eq(styleCategories.categoryId, category.categoryId))
        .limit(1);
      
      if (existingCategory.length === 0) {
        // Insert category
        await db.insert(styleCategories).values({
          categoryId: category.categoryId,
          name: category.name,
          shortName: category.shortName,
          description: category.description,
          iconName: category.iconName,
          mainCategory: category.mainCategory,
          featured: category.featured ? 1 : 0,
          color: category.color || null,
        });
        
        // Insert styles for this category
        console.log(`Adding ${category.styles.length} styles for ${category.name}...`);
        
        for (const style of category.styles) {
          // Check if style already exists
          const existingStyle = await db
            .select()
            .from(cosplayStyles)
            .where(eq(cosplayStyles.styleId, style.styleId))
            .limit(1);
          
          if (existingStyle.length === 0) {
            await db.insert(cosplayStyles).values({
              styleId: style.styleId,
              categoryId: category.categoryId,
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
            console.log(`  Added style: ${style.name}`);
          } else {
            console.log(`  Style ${style.name} already exists, skipping...`);
          }
        }
      } else {
        console.log(`Category ${category.name} already exists, skipping...`);
      }
    }
    
    console.log('Successfully added trendy categories and styles!');
  } catch (error) {
    console.error('Error adding trendy styles:', error);
    throw error;
  }
}

// Run the migration
addTrendyStyles().catch(console.error);