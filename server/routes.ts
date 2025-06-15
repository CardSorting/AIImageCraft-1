import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateImageRequestSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { generateCardRarity } from "./cardRarity";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Compatibility endpoint for Auth0 migration - returns Auth0-compatible format
  app.get('/api/auth/profile', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims) {
        return res.json({ isAuthenticated: false, user: null });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.json({ isAuthenticated: false, user: null });
      }

      // Return Auth0-compatible format for legacy components
      const auth0CompatibleUser = {
        sub: user.id,
        email: user.email,
        given_name: user.firstName,
        family_name: user.lastName,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.email?.split('@')[0] || 'User',
        nickname: user.firstName || user.email?.split('@')[0] || 'User',
        picture: user.profileImageUrl
      };

      res.json({
        isAuthenticated: true,
        user: auth0CompatibleUser,
        userId: user.id
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.json({ isAuthenticated: false, user: null });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI Models endpoints
  app.get("/api/ai-models", async (req, res) => {
    try {
      const { sortBy = 'newest', category, limit = 50 } = req.query;
      const models = await storage.getAIModels(Number(limit), sortBy as string, category as string);
      res.json(models);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      res.status(500).json({ error: "Failed to fetch AI models" });
    }
  });

  app.get("/api/ai-models/featured", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const models = await storage.getFeaturedAIModels(Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error fetching featured models:", error);
      res.status(500).json({ error: "Failed to fetch featured models" });
    }
  });

  app.get("/api/ai-models/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const { limit = 20 } = req.query;
      const models = await storage.searchAIModels(query, Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error searching models:", error);
      res.status(500).json({ error: "Failed to search models" });
    }
  });

  app.get("/api/ai-models/for-you", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit = 20 } = req.query;
      const models = await storage.getForYouModels(userId, Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error fetching personalized models:", error);
      res.status(500).json({ error: "Failed to fetch personalized models" });
    }
  });

  // Legacy /api/models endpoints for frontend compatibility
  app.get("/api/models", async (req, res) => {
    try {
      const { sortBy = 'newest', category, limit = 50 } = req.query;
      const models = await storage.getAIModels(Number(limit), sortBy as string, category as string);
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  app.get("/api/models/bookmarked/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      const models = await storage.getForYouModels(userId, Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error fetching bookmarked models:", error);
      res.status(500).json({ error: "Failed to fetch bookmarked models" });
    }
  });

  app.get("/api/models/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const { limit = 20 } = req.query;
      const models = await storage.searchAIModels(query, Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error searching models:", error);
      res.status(500).json({ error: "Failed to search models" });
    }
  });

  app.get("/api/models/for-you/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;
      const models = await storage.getForYouModels(userId, Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error fetching personalized models:", error);
      res.status(500).json({ error: "Failed to fetch personalized models" });
    }
  });

  // Versioned API endpoints for Clean Architecture compatibility
  app.get("/api/v1/models/catalog", async (req, res) => {
    try {
      const { filter = 'all', sortBy = 'newest', limit = 20, userId = '1' } = req.query;
      
      if (filter === 'bookmarked') {
        const models = await storage.getForYouModels(userId as string, Number(limit));
        res.json({ data: models, meta: { filter, sortBy, limit: Number(limit), count: models.length } });
      } else if (filter === 'for-you') {
        const models = await storage.getForYouModels(userId as string, Number(limit));
        res.json({ data: models, meta: { filter, sortBy, limit: Number(limit), count: models.length } });
      } else {
        const models = await storage.getAIModels(Number(limit), sortBy as string);
        res.json({ data: models, meta: { filter, sortBy, limit: Number(limit), count: models.length } });
      }
    } catch (error) {
      console.error("Error fetching models catalog:", error);
      res.status(500).json({ error: "Failed to fetch models catalog", code: "CATALOG_FETCH_ERROR" });
    }
  });

  app.get("/api/v1/models/bookmarks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      const models = await storage.getForYouModels(userId, Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error fetching bookmarked models:", error);
      res.status(500).json({ error: "Failed to fetch bookmarked models", code: "BOOKMARKS_FETCH_ERROR" });
    }
  });

  app.get("/api/v1/models/recommendations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;
      const models = await storage.getForYouModels(userId, Number(limit));
      res.json({
        data: models,
        meta: {
          userId: parseInt(userId),
          limit: Number(limit),
          count: models.length,
          type: 'personalized'
        }
      });
    } catch (error) {
      console.error("Error fetching personalized models:", error);
      res.status(500).json({ error: "Failed to fetch personalized recommendations", code: "PERSONALIZED_FETCH_ERROR" });
    }
  });

  // Images endpoint
  app.get("/api/images", async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const images = await storage.getImages(Number(limit));
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  // User-specific images endpoint
  app.get("/api/images/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit = 50 } = req.query;
      const images = await storage.getUserImages(userId, Number(limit));
      res.json(images);
    } catch (error) {
      console.error("Error fetching user images:", error);
      res.status(500).json({ error: "Failed to fetch user images" });
    }
  });

  // Credit system endpoints
  app.get("/api/user/credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const balance = await storage.getCreditBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // User statistics endpoint
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get user's generated images count
      const userImages = await storage.getUserImages(userId, 1000);
      const totalImagesGenerated = userImages.length;
      
      // Get user's credit balance
      const currentBalance = await storage.getCreditBalance(userId);
      
      // Get user data to calculate join date
      const user = await storage.getUser(userId);
      
      // Calculate credits spent from transaction history
      const totalCreditsSpent = Math.max(0, totalImagesGenerated); // Each image typically costs 1 credit
      
      const stats = {
        totalImagesGenerated,
        totalCreditsSpent,
        likedModelsCount: 0,
        bookmarkedModelsCount: 0,
        currentCreditBalance: currentBalance,
        joinDate: user?.createdAt?.toISOString() || new Date().toISOString(),
        lastActive: user?.updatedAt?.toISOString() || new Date().toISOString()
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Additional credit balance endpoints for compatibility
  app.get("/api/credits/balance/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const balance = await storage.getCreditBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      res.status(500).json({ error: "Failed to fetch credit balance" });
    }
  });

  app.get("/api/credit-balance/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const balance = await storage.getCreditBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      res.status(500).json({ error: "Failed to fetch credit balance" });
    }
  });

  // Image generation endpoints
  app.post("/api/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check credit balance
      const creditBalance = await storage.getCreditBalance(userId);
      if (creditBalance < 1) {
        return res.status(402).json({ message: "Insufficient credits" });
      }

      // Validate request
      const validatedData = generateImageRequestSchema.parse(req.body);
      
      // Generate rarity for the image
      const rarity = generateCardRarity(validatedData.prompt);

      // Create image record
      const image = {
        id: nanoid(),
        userId,
        prompt: validatedData.prompt,
        imageUrl: "https://placeholder.image.url",
        status: "completed",
        rarityTier: rarity.tier,
        rarityScore: rarity.score,
        rarityStars: rarity.stars,
        rarityLetter: rarity.letter,
        createdAt: new Date()
      };

      // Deduct credits
      await storage.updateCredits(userId, -1, "Image generation");

      res.json(image);
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // Main image generation endpoint used by frontend
  app.post("/api/generate-images", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check credit balance
      const creditBalance = await storage.getCreditBalance(userId);
      if (creditBalance < 1) {
        return res.status(402).json({ 
          success: false,
          message: "Insufficient credits",
          images: [],
          requestId: nanoid()
        });
      }

      // Validate request
      const validatedData = generateImageRequestSchema.parse(req.body);
      
      // Generate rarity for the image
      const rarity = generateCardRarity(validatedData.prompt);

      // Create and save image record to database
      const imageRecord = await storage.createImage({
        userId,
        modelId: validatedData.model,
        prompt: validatedData.prompt,
        negativePrompt: validatedData.negativePrompt || "",
        aspectRatio: validatedData.aspectRatio,
        steps: validatedData.steps,
        cfgScale: validatedData.cfgScale,
        scheduler: validatedData.scheduler ?? "DPMSolverMultistepScheduler",
        imageUrl: `https://picsum.photos/seed/${nanoid()}/512/512`, // Temporary placeholder
        fileName: null,
        fileSize: null,
        seed: null,
        status: "completed",
        rarityTier: rarity.tier,
        rarityScore: rarity.score,
        rarityStars: rarity.stars,
        rarityLetter: rarity.letter,
      });

      // Deduct credits
      await storage.updateCredits(userId, -1, `Image generation: ${validatedData.prompt.substring(0, 50)}...`);

      // Return response in expected format
      const response = {
        success: true,
        images: [imageRecord],
        requestId: nanoid()
      };

      res.json(response);
    } catch (error) {
      console.error("Error generating images:", error);
      
      // Return properly formatted error response
      const errorResponse = {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate images",
        images: [],
        requestId: nanoid()
      };
      
      res.status(500).json(errorResponse);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}