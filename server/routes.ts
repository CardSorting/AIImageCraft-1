import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateImageRequestSchema } from "@shared/schema";
// Remove validateWith import - will validate manually
import { nanoid } from "nanoid";
import { generateCardRarity } from "./cardRarity";
import multer from "multer";
import type { Request, Response } from "express";

const upload = multer({ storage: multer.memoryStorage() });

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

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI Models endpoints
  app.get("/api/models", async (_req, res) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.get("/api/models/:id", async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.getModel(modelId);
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }
      res.json(model);
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ message: "Failed to fetch model" });
    }
  });

  // User interactions
  app.post("/api/models/:id/interact", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const modelId = parseInt(req.params.id);
      const { interactionType } = req.body;

      await storage.recordInteraction({
        userId,
        modelId,
        interactionType,
        metadata: JSON.stringify(req.body.metadata || {}),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error recording interaction:", error);
      res.status(500).json({ message: "Failed to record interaction" });
    }
  });

  // Bookmark endpoints
  app.post("/api/models/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const modelId = parseInt(req.params.id);
      const bookmarked = await storage.toggleBookmark(userId, modelId);
      res.json({ bookmarked });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.get("/api/user/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Like endpoints
  app.post("/api/models/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const modelId = parseInt(req.params.id);
      const liked = await storage.toggleLike(userId, modelId);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/user/likes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likes = await storage.getUserLikes(userId);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
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

  // Image generation endpoint
  interface MulterRequest extends Request {
    file?: Express.Multer.File;
  }

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

      // Create simplified image record for now
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

  // User images endpoint
  app.get("/api/user/images", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const images = await storage.getUserImages(userId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching user images:", error);
      res.status(500).json({ message: "Failed to fetch user images" });
    }
  });

  // Chat endpoints
  app.post("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title } = req.body;
      
      const session = await storage.createChatSession({
        userId,
        title: title || "New Chat",
      });

      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.get("/api/chat/sessions/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const sessionId = req.params.id;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/sessions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.id;
      const { content, role } = req.body;
      
      const message = await storage.addChatMessage({
        sessionId,
        content,
        role: role || "user",
      });

      res.json(message);
    } catch (error) {
      console.error("Error adding chat message:", error);
      res.status(500).json({ message: "Failed to add chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}