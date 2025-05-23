// Seed the Juggernaut Pro Flux model for demonstrating personalization
const seedModel = {
  name: "Juggernaut Pro Flux by RunDiffusion",
  modelId: "rundiffusion:130@100",
  description: "Professional-grade photorealistic image generation model with exceptional detail and quality. Perfect for creating stunning portraits, landscapes, and artistic compositions with FLUX.1D architecture.",
  provider: "RunDiffusion",
  category: "Photorealistic",
  version: "1.0",
  rating: 92, // High quality rating
  likes: 2847,
  downloads: 45230,
  discussions: 189,
  imagesGenerated: 78450,
  tags: ["rundiffusion", "pro", "photorealism", "juggernaut", "flux"],
  capabilities: [
    "High-resolution image generation",
    "Photorealistic portraits",
    "Detailed landscapes",
    "Professional photography style",
    "Advanced lighting control"
  ],
  thumbnail: "https://mim.runware.ai/r/67bf6a306dc46-1024x1365.jpg",
  gallery: [
    "https://mim.runware.ai/r/67bf6a306dc46-1024x1365.jpg"
  ],
  featured: 1, // Mark as featured
  pricing: JSON.stringify({
    free: { credits: 5, costPerImage: 0 },
    pro: { credits: 100, costPerImage: 0.02 },
    enterprise: { unlimited: true, costPerImage: 0.01 }
  })
};

console.log('Model data prepared:', JSON.stringify(seedModel, null, 2));