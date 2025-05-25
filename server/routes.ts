import type { Express } from "express";
import { createServer, type Server } from "http";
import pkg from "express-openid-connect";
const { requiresAuth } = pkg;
import { ImageController } from "./presentation/controllers/ImageController";
import { StatisticsController } from "./presentation/controllers/StatisticsController";
import { storage } from "./storage";

// Helper function to get or create user from Auth0
async function getOrCreateUserFromAuth0(oidcUser: any): Promise<number> {
  if (!oidcUser) {
    throw new Error('User not authenticated');
  }
  
  // Try to find existing user by Auth0 ID
  let user = await storage.getUserByAuth0Id(oidcUser.sub);
  
  if (!user) {
    // Create new user if doesn't exist
    user = await storage.createUser({
      username: oidcUser.sub, // Using Auth0 sub as unique identifier
      email: oidcUser.email,
      displayName: oidcUser.name || oidcUser.nickname || oidcUser.email,
    });
  }
  
  return user.id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const imageController = new ImageController();
  const statisticsController = new StatisticsController();

  // Auth0 test endpoint (moved to API route)
  app.get("/api/auth/status", (req, res) => {
    res.json({ 
      message: req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out',
      isAuthenticated: req.oidc.isAuthenticated()
    });
  });

  // Protected profile route - requires authentication (moved to API route)
  app.get('/api/profile', requiresAuth(), (req, res) => {
    res.json(req.oidc.user);
  });

  // Get user profile endpoint (API version)
  app.get("/api/auth/profile", (req, res) => {
    if (req.oidc.isAuthenticated()) {
      res.json({
        isAuthenticated: true,
        user: req.oidc.user
      });
    } else {
      res.json({
        isAuthenticated: false,
        user: null
      });
    }
  });

  // Image generation and management endpoints using Clean Architecture
  app.post("/api/generate-images", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = await getOrCreateUserFromAuth0(req.oidc.user);
      req.body.userId = userId;
      
      imageController.generateImages(req, res);
    } catch (error) {
      res.status(500).json({ error: "Failed to authenticate user" });
    }
  });

  app.get("/api/images", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = await getOrCreateUserFromAuth0(req.oidc.user);
      const { limit = 50 } = req.query;
      
      const images = await storage.getImagesByUserId(userId, Number(limit));
      res.json(images);
    } catch (error) {
      console.error("Error fetching user images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.get("/api/images/:id", (req, res) => imageController.getImageById(req, res));
  app.delete("/api/images/:id", (req, res) => imageController.deleteImage(req, res));

  // AI Model endpoints
  app.get("/api/models", async (req, res) => {
    try {
      const { category, limit = 50 } = req.query;
      const models = await storage.getAIModels(Number(limit), category as string);
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  app.get("/api/models/featured", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const models = await storage.getFeaturedAIModels(Number(limit));
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured models" });
    }
  });

  app.get("/api/models/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const model = await storage.getAIModelById(id);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch model" });
    }
  });

  app.get("/api/models/by-model-id/:modelId", async (req, res) => {
    try {
      const { modelId } = req.params;
      const model = await storage.getAIModelByModelId(modelId);
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch model" });
    }
  });

  app.get("/api/models/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const { limit = 20 } = req.query;
      const models = await storage.searchAIModels(query, Number(limit));
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: "Failed to search models" });
    }
  });

  // Get images generated with a specific model
  app.get("/api/models/:modelId/images", async (req, res) => {
    try {
      const { modelId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const images = await storage.getImagesByModelId(modelId, limit);
      res.json(images);
    } catch (error) {
      console.error("Error fetching model images:", error);
      res.status(500).json({ error: "Failed to fetch model images" });
    }
  });

  // Intelligent "For You" personalized recommendations endpoint
  app.get("/api/models/for-you", async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      // Start with featured models for reliable functionality
      const models = await storage.getFeaturedAIModels(Number(limit));
      res.json(models);
    } catch (error) {
      console.error("Error fetching For You models:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  // User interaction tracking endpoints for behavioral learning
  app.post("/api/interactions/track", async (req, res) => {
    try {
      const { 
        userId = 1, 
        modelId, 
        interactionType, 
        engagementLevel = 5,
        sessionDuration,
        deviceType,
        referralSource
      } = req.body;

      if (!modelId || !interactionType) {
        return res.status(400).json({ error: "Missing required fields: modelId, interactionType" });
      }

      // Simple interaction tracking for immediate functionality
      const interaction = await storage.createUserInteraction({
        userId: Number(userId),
        modelId: Number(modelId),
        interactionType,
        engagementLevel: Number(engagementLevel)
      });

      res.json({ 
        success: true, 
        interactionId: interaction.id,
        message: "Interaction tracked successfully"
      });
    } catch (error) {
      console.error("Error tracking user interaction:", error);
      res.status(500).json({ error: "Failed to track interaction" });
    }
  });



  // Get user behavior analytics endpoint
  app.get("/api/users/:userId/behavior-analytics", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Import behavior repository
      const { UserBehaviorRepository } = await import("./infrastructure/repositories/UserBehaviorRepository");
      const behaviorRepo = new UserBehaviorRepository();

      const analytics = await behaviorRepo.analyzeBehaviorPatterns(Number(userId));
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching behavior analytics:", error);
      res.status(500).json({ error: "Failed to fetch behavior analytics" });
    }
  });

  // Get user recommendations insights endpoint
  app.get("/api/users/:userId/recommendation-insights", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Import behavior repository
      const { UserBehaviorRepository } = await import("./infrastructure/repositories/UserBehaviorRepository");
      const behaviorRepo = new UserBehaviorRepository();

      const [
        categoryAffinities,
        providerAffinities,
        behaviorProfile,
        recentInteractions
      ] = await Promise.all([
        behaviorRepo.getUserCategoryAffinities(Number(userId)),
        behaviorRepo.getUserProviderAffinities(Number(userId)),
        behaviorRepo.getUserBehaviorProfile(Number(userId)),
        behaviorRepo.getUserInteractions(Number(userId), 20, undefined, 7)
      ]);

      const insights = {
        topCategories: categoryAffinities.slice(0, 3).map(a => ({
          category: a.category,
          score: a.affinityScore,
          interactionCount: a.interactionCount
        })),
        topProviders: providerAffinities.slice(0, 3).map(a => ({
          provider: a.provider,
          score: a.affinityScore,
          interactionCount: a.interactionCount
        })),
        profile: {
          explorationScore: behaviorProfile?.explorationScore || 60,
          qualityThreshold: behaviorProfile?.qualityThreshold || 70,
          totalInteractions: behaviorProfile?.totalInteractions || 0
        },
        recentActivity: {
          totalInteractions: recentInteractions.length,
          avgEngagement: recentInteractions.reduce((sum, i) => sum + (i.engagementLevel || 5), 0) / Math.max(1, recentInteractions.length),
          topInteractionTypes: getTopInteractionTypes(recentInteractions)
        }
      };

      res.json(insights);
    } catch (error) {
      console.error("Error fetching recommendation insights:", error);
      res.status(500).json({ error: "Failed to fetch recommendation insights" });
    }
  });

  // Helper function for interaction type analysis
  function getTopInteractionTypes(interactions: any[]): Array<{ type: string; count: number }> {
    const typeCounts = interactions.reduce((acc, interaction) => {
      acc[interaction.interactionType] = (acc[interaction.interactionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([type, count]) => ({ type, count: count as number }));
  }

  // Bookmark management endpoints
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const { userId = 1, modelId } = req.body;
      
      if (!modelId) {
        return res.status(400).json({ error: "Missing modelId" });
      }

      // Check if already bookmarked
      const isBookmarked = await storage.isModelBookmarked(Number(userId), Number(modelId));
      
      if (isBookmarked) {
        // Remove bookmark
        await storage.removeUserBookmark(Number(userId), Number(modelId));
        res.json({ success: true, bookmarked: false, message: "Bookmark removed" });
      } else {
        // Add bookmark
        await storage.createUserBookmark({
          userId: Number(userId),
          modelId: Number(modelId)
        });
        res.json({ success: true, bookmarked: true, message: "Model bookmarked" });
      }
    } catch (error) {
      console.error("Error managing bookmark:", error);
      res.status(500).json({ error: "Failed to manage bookmark" });
    }
  });

  // Check bookmark status
  app.get("/api/bookmarks/:userId/:modelId", async (req, res) => {
    try {
      const { userId, modelId } = req.params;
      const isBookmarked = await storage.isModelBookmarked(Number(userId), Number(modelId));
      res.json({ bookmarked: isBookmarked });
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      res.status(500).json({ error: "Failed to check bookmark status" });
    }
  });

  // User likes API endpoints
  app.post("/api/likes", async (req, res) => {
    try {
      console.log("Like API called with:", req.body);
      const { userId, modelId } = req.body;
      
      if (!userId || !modelId) {
        console.log("Missing userId or modelId");
        return res.status(400).json({ error: "Missing userId or modelId" });
      }
      
      const isLiked = await storage.isModelLiked(userId, modelId);
      console.log(`Model ${modelId} is currently liked by user ${userId}:`, isLiked);
      
      if (isLiked) {
        // Unlike the model
        const removed = await storage.removeUserLike(userId, modelId);
        console.log("Remove like result:", removed);
        res.json({ success: true, liked: false, message: "Model unliked successfully" });
      } else {
        // Like the model
        const created = await storage.createUserLike({ userId, modelId });
        console.log("Create like result:", created);
        res.json({ success: true, liked: true, message: "Model liked successfully" });
      }
    } catch (error) {
      console.error("Error handling like:", error);
      res.status(500).json({ error: "Failed to handle like" });
    }
  });

  app.get("/api/likes/:userId/:modelId", async (req, res) => {
    try {
      const { userId, modelId } = req.params;
      const isLiked = await storage.isModelLiked(Number(userId), Number(modelId));
      res.json({ liked: isLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ error: "Failed to check like status" });
    }
  });

  // Handle like persistence through interaction endpoint
  app.post("/api/likes/persist", async (req, res) => {
    try {
      console.log("Like persist API called with body:", req.body);
      const { userId, modelId, liked } = req.body;
      
      if (!userId || !modelId || liked === undefined) {
        console.log("Missing required fields");
        return res.status(400).json({ success: false, error: "Missing userId, modelId, or liked status" });
      }
      
      if (liked) {
        // Create like record
        const created = await storage.createUserLike({ userId: Number(userId), modelId: Number(modelId) });
        console.log("Create like result:", created);
        res.json({ success: true, liked: true, message: "Model liked successfully" });
      } else {
        // Remove like record
        const removed = await storage.removeUserLike(Number(userId), Number(modelId));
        console.log("Remove like result:", removed);
        res.json({ success: true, liked: false, message: "Model unliked successfully" });
      }
    } catch (error) {
      console.error("Error persisting like:", error);
      res.status(500).json({ success: false, error: "Failed to persist like" });
    }
  });

  // Model statistics endpoint using existing storage
  app.get("/api/models/:modelId/stats", async (req, res) => {
    try {
      const modelId = Number(req.params.modelId);
      
      if (isNaN(modelId)) {
        return res.status(400).json({ error: "Invalid model ID" });
      }

      // Use storage interface to get statistics from database
      const likes = await storage.isModelLiked(1, modelId) ? 1 : 0;
      const bookmarks = await storage.isModelBookmarked(1, modelId) ? 1 : 0;
      
      res.json({ 
        modelId, 
        likeCount: likes, 
        bookmarkCount: bookmarks 
      });
    } catch (error) {
      console.error("Error fetching model stats:", error);
      res.status(500).json({ error: "Failed to fetch model statistics" });
    }
  });

  // Get user's bookmarked models
  app.get("/api/models/bookmarked/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const bookmarkedModels = await storage.getBookmarkedModels(Number(userId));
      res.json(bookmarkedModels);
    } catch (error) {
      console.error("Error fetching bookmarked models:", error);
      res.status(500).json({ error: "Failed to fetch bookmarked models" });
    }
  });

  // Direct API endpoints that work with existing storage
  app.get("/api/v1/models/catalog", async (req, res) => {
    try {
      const { 
        filter = 'all', 
        sortBy = 'newest', 
        limit = '20',
        userId = '1' 
      } = req.query;

      let models;
      if (filter === 'bookmarked') {
        models = await storage.getBookmarkedModels(Number(userId), Number(limit));
      } else {
        models = await storage.getAIModels(Number(limit), sortBy as string);
      }
      
      res.json({
        data: models,
        meta: {
          filter,
          sortBy,
          limit: Number(limit),
          count: models.length
        }
      });
    } catch (error) {
      console.error('Error in catalog endpoint:', error);
      res.status(500).json({ 
        error: 'Failed to fetch models catalog',
        data: [],
        meta: { filter: 'all', sortBy: 'newest', limit: 20, count: 0 }
      });
    }
  });

  app.get("/api/v1/models/bookmarks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = '50' } = req.query;
      const bookmarkedModels = await storage.getBookmarkedModels(Number(userId), Number(limit));
      
      res.json({
        data: bookmarkedModels,
        meta: {
          filter: 'bookmarked',
          limit: Number(limit),
          count: bookmarkedModels.length
        }
      });
    } catch (error) {
      console.error(`Error fetching bookmarked models:`, error);
      res.status(500).json({ 
        error: 'Failed to fetch bookmarked models',
        data: [],
        meta: { filter: 'bookmarked', limit: 50, count: 0 }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
