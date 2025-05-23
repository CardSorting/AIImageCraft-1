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
      const { 
        userId = 1, // Demo user ID - in production this would come from auth
        limit = 20,
        excludeIds,
        sessionDuration,
        currentCategory
      } = req.query;

      // Import the personalization system
      const { IntelligentPersonalizationEngine } = await import("./infrastructure/services/IntelligentPersonalizationEngine");
      const { GetPersonalizedRecommendationsQueryHandler } = await import("./application/handlers/GetPersonalizedRecommendationsQueryHandler");
      const { GetPersonalizedRecommendationsQuery } = await import("./application/commands/GetPersonalizedRecommendationsQuery");

      // Initialize the intelligent recommendation system
      const personalizationEngine = new IntelligentPersonalizationEngine();
      const queryHandler = new GetPersonalizedRecommendationsQueryHandler(personalizationEngine);

      // Create the query with session context
      const query = new GetPersonalizedRecommendationsQuery(
        Number(userId),
        Number(limit),
        excludeIds ? excludeIds.toString().split(',').map(Number) : [],
        true, // include reasons
        {
          sessionDuration: sessionDuration ? Number(sessionDuration) : undefined,
          currentCategory: currentCategory?.toString(),
          pagesViewed: ['/models'],
          modelsViewed: [],
          searchQueries: []
        }
      );

      // Generate intelligent recommendations
      const response = await queryHandler.handle(query);

      // Transform to match the expected format
      const forYouModels = response.recommendations.map(rec => ({
        ...rec.model,
        _recommendation: {
          relevanceScore: rec.relevanceScore,
          confidenceScore: rec.confidenceScore,
          reasons: rec.recommendationReason,
          diversityFactor: rec.diversityFactor
        }
      }));

      res.json(forYouModels);
    } catch (error) {
      console.error("Error generating For You recommendations:", error);
      // Fallback to featured models
      const fallbackModels = await storage.getFeaturedAIModels(Number(req.query.limit) || 20);
      res.json(fallbackModels);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
