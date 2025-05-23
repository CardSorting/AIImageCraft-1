import type { Express } from "express";
import { createServer, type Server } from "http";
import { ImageController } from "./presentation/controllers/ImageController";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const imageController = new ImageController();

  // Image generation and management endpoints using Clean Architecture
  app.post("/api/generate-images", (req, res) => imageController.generateImages(req, res));
  app.get("/api/images", (req, res) => imageController.getImages(req, res));
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

  // Helper function for affinity calculation
  function calculateAffinityBoost(interactionType: string, engagementLevel: number): number {
    const baseBoosts = {
      view: 0.1,
      like: 0.3,
      bookmark: 0.5,
      generate: 0.7,
      share: 0.4,
      download: 0.6
    };
    
    const baseBoost = baseBoosts[interactionType as keyof typeof baseBoosts] || 0.1;
    const engagementMultiplier = engagementLevel / 10;
    
    return Math.min(1.0, baseBoost * engagementMultiplier * 1.5);
  }

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

  const httpServer = createServer(app);
  return httpServer;
}
