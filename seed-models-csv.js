import { db } from "./server/db.js";
import { aiModels } from "./shared/schema.js";
import { eq } from "drizzle-orm";

// Models data from the CSV file
const modelsData = [
  {
    name: "HiDream-I1-Dev",
    checkpoint: "HiDream",
    thumbnail: "https://mim.runware.ai/r/682f388d22a27-880x1168.jpg",
    modelId: "runware:97@2"
  },
  {
    name: "HiDream-I1-Fast",
    checkpoint: "HiDream",
    thumbnail: "https://my.runware.ai/assets/no-image-qHGxvh9x.jpeg",
    modelId: "runware:97@1"
  },
  {
    name: "HiDream-I1-Full",
    checkpoint: "HiDream",
    thumbnail: "https://mim.runware.ai/r/682f3861e07f8-880x1168.jpg",
    modelId: "runware:97@1"
  },
  {
    name: "FLUX Dev",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c1e3076ad38-768x1024.jpg",
    modelId: "runware:101@1"
  },
  {
    name: "FLUX Schnell",
    checkpoint: "FLUX.1 S",
    thumbnail: "https://mim.runware.ai/r/67c1e2d8a5e3c-768x1024.jpg",
    modelId: "runware:100@1"
  },
  {
    name: "Pony Realism",
    checkpoint: "Pony",
    thumbnail: "https://mim.runware.ai/r/67c36272cfcc0-1664x2432.jpg",
    modelId: "civitai:372465@914390"
  },
  {
    name: "DreamShaper XL",
    checkpoint: "SDXL",
    thumbnail: "https://mim.runware.ai/r/67c362c0cbc1c-1600x2133.jpg",
    modelId: "civitai:112902@126688"
  },
  {
    name: "Pony Diffusion V6 XL",
    checkpoint: "Pony",
    thumbnail: "https://mim.runware.ai/r/66c33a567b927-450x600.jpg",
    modelId: "civitai:257749@290640"
  },
  {
    name: "PixelWave",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c3843495d64-1344x1728.jpg",
    modelId: "civitai:141592@992642"
  },
  {
    name: "UltraReal Fine-Tune",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c3a5a889bf9-1216x832.jpg",
    modelId: "civitai:978314@1319700"
  },
  {
    name: "[Lah] Mysterious",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c37739d2658-768x1280.jpg",
    modelId: "civitai:118441@872820"
  },
  {
    name: "Fluxmania",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/6791ec05b012e-450x579.jpg",
    modelId: "civitai:778691@1205317"
  },
  {
    name: "RedCraft",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67b2c7951fbe9-450x900.jpg",
    modelId: "civitai:958009@1387169"
  },
  {
    name: "iNiverse Mix XL",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/671871b22f64d-450x579.jpg",
    modelId: "civitai:226533@973626"
  },
  {
    name: "Carnival",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c622af49059-960x1280.jpg",
    modelId: "civitai:732481@819105"
  },
  {
    name: "blue_pencil-flux1",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c4ec753f720-1024x1536.jpg",
    modelId: "civitai:722776@808159"
  },
  {
    name: "XE: Retro Anime Flux",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c12759cd2b1-768x1152.jpg",
    modelId: "civitai:783000@884161"
  },
  {
    name: "FillLUX_Spoopy",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c24eb4f4071-1200x1200.jpg",
    modelId: "civitai:621563@694866"
  },
  {
    name: "Crystal Clear Super",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/67c1a2e0581ca-832x1216.jpg",
    modelId: "civitai:1102583@1238590"
  },
  {
    name: "Copax TimeLess",
    checkpoint: "FLUX.1 D",
    thumbnail: "https://mim.runware.ai/r/670d2cadbba39-450x600.jpg",
    modelId: "civitai:118111@954640"
  }
];

// Helper function to determine provider from modelId
function getProvider(modelId) {
  if (modelId.startsWith("runware:")) return "Runware";
  if (modelId.startsWith("civitai:")) return "CivitAI";
  return "Unknown";
}

// Helper function to determine category from checkpoint type
function getCategory(checkpoint) {
  if (checkpoint.includes("FLUX")) return "FLUX";
  if (checkpoint.includes("Pony")) return "Pony";
  if (checkpoint.includes("SDXL")) return "SDXL";
  if (checkpoint.includes("HiDream")) return "HiDream";
  return "General";
}

// Helper function to generate description based on model name and checkpoint
function generateDescription(name, checkpoint) {
  const descriptions = {
    "FLUX.1 D": "Advanced FLUX.1 Dev model delivering exceptional quality and detail for professional image generation.",
    "FLUX.1 S": "Fast FLUX.1 Schnell model optimized for quick generation while maintaining excellent quality.",
    "Pony": "Versatile Pony model excellent for anime, cartoon, and stylized image generation.",
    "SDXL": "Stable Diffusion XL model providing high-resolution, detailed image generation.",
    "HiDream": "HiDream model focused on dream-like, artistic image generation with unique style."
  };
  
  const baseDescription = descriptions[checkpoint] || "High-quality AI image generation model with advanced capabilities.";
  return `${name} - ${baseDescription}`;
}

// Helper function to generate tags based on model name and checkpoint
function generateTags(name, checkpoint) {
  const baseTags = [checkpoint.toLowerCase().replace(/\s+/g, '-'), "ai", "image-generation"];
  
  // Add specific tags based on model name
  if (name.toLowerCase().includes("anime")) baseTags.push("anime", "cartoon");
  if (name.toLowerCase().includes("realism") || name.toLowerCase().includes("real")) baseTags.push("photorealistic", "realistic");
  if (name.toLowerCase().includes("art") || name.toLowerCase().includes("artistic")) baseTags.push("artistic", "creative");
  if (name.toLowerCase().includes("fast") || name.toLowerCase().includes("speed")) baseTags.push("fast", "quick");
  if (name.toLowerCase().includes("pro") || name.toLowerCase().includes("professional")) baseTags.push("professional", "premium");
  
  return baseTags;
}

// Helper function to generate capabilities
function generateCapabilities(checkpoint) {
  const capabilityMap = {
    "FLUX.1 D": ["High-resolution generation", "Advanced prompt following", "Professional quality", "Detailed rendering"],
    "FLUX.1 S": ["Fast generation", "Quick iterations", "Efficient processing", "Real-time creation"],
    "Pony": ["Anime style generation", "Character creation", "Stylized art", "Cartoon rendering"],
    "SDXL": ["High-resolution output", "Stable generation", "Versatile styles", "Professional quality"],
    "HiDream": ["Artistic generation", "Dream-like imagery", "Creative styles", "Unique aesthetics"]
  };
  
  return capabilityMap[checkpoint] || ["Image generation", "AI-powered creation", "High quality output"];
}

// Transform and seed the models
async function seedModels() {
  console.log("Starting to seed AI models...");
  
  for (const model of modelsData) {
    try {
      const provider = getProvider(model.modelId);
      const category = getCategory(model.checkpoint);
      const description = generateDescription(model.name, model.checkpoint);
      const tags = generateTags(model.name, model.checkpoint);
      const capabilities = generateCapabilities(model.checkpoint);
      
      // Generate realistic stats
      const baseRating = Math.floor(Math.random() * 20) + 75; // 75-95 rating
      const downloads = Math.floor(Math.random() * 50000) + 5000; // 5k-55k downloads
      const likes = Math.floor(downloads * (Math.random() * 0.1 + 0.05)); // 5-15% of downloads
      const discussions = Math.floor(likes * (Math.random() * 0.3 + 0.1)); // 10-40% of likes
      const imagesGenerated = downloads * Math.floor(Math.random() * 10 + 5); // 5-15x downloads
      
      const seedData = {
        modelId: model.modelId,
        name: model.name,
        description: description,
        category: category,
        version: "1.0",
        provider: provider,
        featured: Math.random() > 0.8 ? 1 : 0, // 20% chance of being featured
        rating: baseRating,
        downloads: downloads,
        likes: likes,
        discussions: discussions,
        imagesGenerated: imagesGenerated,
        tags: tags,
        capabilities: capabilities,
        thumbnail: model.thumbnail,
        gallery: [model.thumbnail],
        pricing: JSON.stringify({
          free: { credits: 3, costPerImage: 0 },
          pro: { credits: 50, costPerImage: 0.02 },
          enterprise: { unlimited: true, costPerImage: 0.015 }
        })
      };
      
      // Check if model already exists
      const existing = await db.select().from(aiModels).where(eq(aiModels.modelId, model.modelId));
      
      if (existing.length === 0) {
        await db.insert(aiModels).values(seedData);
        console.log(`✅ Seeded model: ${model.name}`);
      } else {
        console.log(`⚠️  Model already exists: ${model.name}`);
      }
      
    } catch (error) {
      console.error(`❌ Error seeding model ${model.name}:`, error);
    }
  }
  
  console.log("✨ Model seeding completed!");
}

// Run the seeder
seedModels().catch(console.error);