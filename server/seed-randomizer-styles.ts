/**
 * Seed sophisticated randomizer styles with detailed scenes and artistic combinations
 */

import { db } from "./db";
import { randomizerStyles } from "@shared/schema";

const SOPHISTICATED_RANDOMIZER_STYLES = [
  // Scene-Based Combinations
  {
    styleId: "cyberpunk-neon-rain",
    name: "Cyberpunk Neon Rain",
    description: "Standing in a rain-soaked cyberpunk street with neon reflections",
    prompt: "cyberpunk street scene in heavy rain, neon lights reflecting on wet pavement, holographic advertisements, urban decay, moody lighting",
    category: "scene",
    subCategory: "urban-futuristic",
    tags: ["cyberpunk", "rain", "neon", "urban", "atmospheric"],
    complexity: "complex",
    rarity: "uncommon"
  },
  {
    styleId: "japanese-temple-sunset",
    name: "Japanese Temple at Sunset",
    description: "Serene temple grounds during golden hour with cherry blossoms",
    prompt: "ancient Japanese temple at sunset, cherry blossoms falling, golden hour lighting, traditional architecture, peaceful atmosphere",
    category: "scene",
    subCategory: "cultural-traditional",
    tags: ["japanese", "temple", "sunset", "cherry-blossoms", "peaceful"],
    complexity: "medium",
    rarity: "common"
  },
  {
    styleId: "underwater-coral-city",
    name: "Underwater Coral City",
    description: "Mystical underwater city with bioluminescent coral structures",
    prompt: "underwater coral city, bioluminescent organisms, flowing seaweed, aquatic architecture, ethereal blue lighting",
    category: "scene",
    subCategory: "fantasy-aquatic",
    tags: ["underwater", "coral", "bioluminescent", "fantasy", "mystical"],
    complexity: "complex",
    rarity: "rare"
  },
  
  // Artistic Style Combinations
  {
    styleId: "renaissance-chiaroscuro",
    name: "Renaissance Chiaroscuro",
    description: "Classical Renaissance painting with dramatic light and shadow",
    prompt: "Renaissance painting style, dramatic chiaroscuro lighting, classical composition, oil painting texture, masterful technique",
    category: "artistic",
    subCategory: "classical-painting",
    tags: ["renaissance", "chiaroscuro", "classical", "oil-painting", "dramatic"],
    complexity: "complex",
    rarity: "uncommon"
  },
  {
    styleId: "impressionist-garden",
    name: "Impressionist Garden",
    description: "Soft impressionist style in a blooming garden setting",
    prompt: "impressionist painting style, blooming garden, soft brushstrokes, natural lighting, pastel colors, Monet-inspired",
    category: "artistic",
    subCategory: "impressionist",
    tags: ["impressionist", "garden", "soft", "pastel", "natural"],
    complexity: "medium",
    rarity: "common"
  },
  {
    styleId: "art-nouveau-botanical",
    name: "Art Nouveau Botanical",
    description: "Elegant Art Nouveau style with flowing botanical elements",
    prompt: "Art Nouveau style, flowing botanical patterns, elegant curves, decorative elements, vintage poster aesthetic",
    category: "artistic",
    subCategory: "decorative-arts",
    tags: ["art-nouveau", "botanical", "elegant", "decorative", "vintage"],
    complexity: "complex",
    rarity: "rare"
  },
  
  // Mood and Atmosphere
  {
    styleId: "gothic-cathedral-mystery",
    name: "Gothic Cathedral Mystery",
    description: "Dark atmospheric scene in an ancient gothic cathedral",
    prompt: "gothic cathedral interior, mysterious atmosphere, stained glass windows, dramatic shadows, ancient stone architecture",
    category: "mood",
    subCategory: "dark-atmospheric",
    tags: ["gothic", "cathedral", "mysterious", "dramatic", "ancient"],
    complexity: "complex",
    rarity: "uncommon"
  },
  {
    styleId: "enchanted-forest-dawn",
    name: "Enchanted Forest Dawn",
    description: "Magical forest scene at dawn with mystical creatures",
    prompt: "enchanted forest at dawn, magical creatures, fairy lights, mystical atmosphere, ethereal morning mist",
    category: "mood",
    subCategory: "fantasy-magical",
    tags: ["enchanted", "forest", "dawn", "magical", "mystical"],
    complexity: "medium",
    rarity: "common"
  },
  {
    styleId: "steampunk-workshop",
    name: "Steampunk Workshop",
    description: "Victorian-era workshop filled with mechanical inventions",
    prompt: "steampunk workshop, Victorian-era machinery, brass and copper, mechanical inventions, industrial atmosphere",
    category: "mood",
    subCategory: "industrial-vintage",
    tags: ["steampunk", "workshop", "victorian", "mechanical", "industrial"],
    complexity: "complex",
    rarity: "uncommon"
  },
  
  // Environment Combinations
  {
    styleId: "arctic-aurora-landscape",
    name: "Arctic Aurora Landscape",
    description: "Frozen tundra with dancing northern lights overhead",
    prompt: "arctic landscape, northern lights aurora, frozen tundra, starry night sky, ethereal green lights dancing",
    category: "environment",
    subCategory: "natural-phenomena",
    tags: ["arctic", "aurora", "frozen", "starry", "ethereal"],
    complexity: "medium",
    rarity: "uncommon"
  },
  {
    styleId: "volcanic-glass-cave",
    name: "Volcanic Glass Cave",
    description: "Crystal cave formed by volcanic activity with gem formations",
    prompt: "volcanic glass cave, crystal formations, geothermal lighting, obsidian walls, mineral deposits glowing",
    category: "environment",
    subCategory: "geological",
    tags: ["volcanic", "crystal", "cave", "geothermal", "minerals"],
    complexity: "complex",
    rarity: "rare"
  },
  {
    styleId: "floating-sky-islands",
    name: "Floating Sky Islands",
    description: "Mystical islands suspended in the clouds",
    prompt: "floating sky islands, suspended in clouds, waterfalls cascading down, ethereal atmosphere, fantasy landscape",
    category: "environment",
    subCategory: "fantasy-aerial",
    tags: ["floating", "sky", "islands", "clouds", "fantasy"],
    complexity: "complex",
    rarity: "epic"
  },
  
  // Legendary Combinations
  {
    styleId: "time-spiral-dimension",
    name: "Time Spiral Dimension",
    description: "Reality-bending scene where time flows in visible spirals",
    prompt: "time spiral dimension, reality bending, temporal distortions, clock elements floating, surreal time visualization",
    category: "scene",
    subCategory: "surreal-temporal",
    tags: ["time", "spiral", "dimensional", "surreal", "temporal"],
    complexity: "complex",
    rarity: "legendary"
  },
  {
    styleId: "cosmic-web-observatory",
    name: "Cosmic Web Observatory",
    description: "Space observatory revealing the cosmic web structure",
    prompt: "cosmic web observatory, galaxy connections visible, space telescope, cosmic filaments, universe structure revealed",
    category: "environment",
    subCategory: "cosmic-space",
    tags: ["cosmic", "observatory", "galaxy", "space", "universe"],
    complexity: "complex",
    rarity: "legendary"
  },
  {
    styleId: "elemental-convergence",
    name: "Elemental Convergence",
    description: "All four elements meeting in perfect harmony",
    prompt: "elemental convergence, fire water earth air meeting, perfect balance, swirling elements, harmonious energy",
    category: "mood",
    subCategory: "elemental-magic",
    tags: ["elemental", "convergence", "fire", "water", "earth", "air", "balance"],
    complexity: "complex",
    rarity: "epic"
  }
];

async function seedRandomizerStyles() {
  console.log('Seeding sophisticated randomizer styles...');
  
  try {
    for (const style of SOPHISTICATED_RANDOMIZER_STYLES) {
      await db.insert(randomizerStyles).values({
        styleId: style.styleId,
        name: style.name,
        description: style.description,
        prompt: style.prompt,
        category: style.category,
        subCategory: style.subCategory,
        tags: style.tags,
        complexity: style.complexity,
        rarity: style.rarity,
        active: 1,
        usageCount: 0,
        rating: "4.5"
      }).onConflictDoNothing();
      
      console.log(`  ✓ Added: ${style.name}`);
    }
    
    console.log(`\nSuccessfully seeded ${SOPHISTICATED_RANDOMIZER_STYLES.length} randomizer styles!`);
    console.log('Categories created:');
    console.log('  - Scene-based combinations with detailed environments');
    console.log('  - Artistic style combinations with technical depth');
    console.log('  - Mood and atmosphere variations');
    console.log('  - Complex environment combinations');
    console.log('  - Legendary rare combinations');
    
  } catch (error) {
    console.error('Error seeding randomizer styles:', error);
    throw error;
  }
}

seedRandomizerStyles()
  .then(() => {
    console.log('Randomizer styles seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Randomizer styles seeding failed:', error);
    process.exit(1);
  });