import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ImageController } from "./presentation/controllers/ImageController";
import { StatisticsController } from "./presentation/controllers/StatisticsController";
import { storage } from "./storage";
import { pool } from "./infrastructure/db";
import Stripe from "stripe";
import { nanoid } from "nanoid";
import multer from "multer";
import { 
  createPerformanceMiddleware, 
  createUltraFastQuery, 
  queryCache, 
  getPerformanceStats,
  performanceMonitor
} from "./infrastructure/ultra-performance-engine";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to get user ID from Replit Auth
export function getUserIdFromReplit(req: any): string {
  if (!req.user?.claims?.sub) {
    throw new Error('User not authenticated');
  }
  return req.user.claims.sub;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Apply ultra-performance middleware globally
  app.use(createPerformanceMiddleware());
  
  const imageController = new ImageController();
  const statisticsController = new StatisticsController();

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

  // Get user profile endpoint (API version)
  app.get("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      
      // Get user's current credit balance
      const balanceResult = await pool.query(
        'SELECT amount FROM credit_balances WHERE user_id = $1',
        [userId]
      );
      const creditBalance = balanceResult.rows[0]?.amount || 0;
      
      res.json({
        isAuthenticated: true,
        user: req.user.claims,
        userId: userId,
        creditBalance: parseFloat(creditBalance)
      });
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({ 
        message: "Failed to get user profile",
        creditBalance: 0
      });
    }
  });

  // Test endpoints for development
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
  });

  // Image generation endpoint
  app.post("/api/generate-images", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      
      // Use image controller to handle generation
      const result = await imageController.generateImage(req, res);
      return result;
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Get images for authenticated user
  app.get("/api/images", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const images = await storage.getImagesByUserId(userId, 50);
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  // Get AI models
  app.get("/api/ai-models", async (req, res) => {
    try {
      const { limit = 50, sortBy = 'newest', category } = req.query;
      const models = await storage.getAIModels(
        parseInt(limit as string), 
        sortBy as string, 
        category as string
      );
      res.json(models);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      res.status(500).json({ error: "Failed to fetch AI models" });
    }
  });

  // Credit management endpoints
  app.get("/api/credits/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const balanceResult = await pool.query(
        'SELECT amount FROM credit_balances WHERE user_id = $1',
        [userId]
      );
      const balance = balanceResult.rows[0]?.amount || 0;
      res.json({ balance: parseFloat(balance) });
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      res.status(500).json({ error: "Failed to fetch credit balance" });
    }
  });

  // Stripe payment endpoints
  app.post("/api/stripe/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const { amount, packageId } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          userId,
          packageId: packageId?.toString() || ''
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Chat session endpoints
  app.get("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const sessions = await storage.getChatSessions(userId, 50);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const { title, previewImage } = req.body;
      
      const session = await storage.createChatSession({
        id: nanoid(),
        userId,
        title: title || "New Chat",
        previewImage: previewImage || null,
        messageCount: 0,
        lastActivity: new Date()
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // User interaction endpoints (bookmarks, likes)
  app.post("/api/models/:modelId/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const bookmark = await storage.createUserBookmark({
        userId,
        modelId
      });
      
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  app.delete("/api/models/:modelId/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const success = await storage.removeUserBookmark(userId, modelId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });

  app.post("/api/models/:modelId/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const like = await storage.createUserLike({
        userId,
        modelId
      });
      
      res.json(like);
    } catch (error) {
      console.error("Error creating like:", error);
      res.status(500).json({ error: "Failed to create like" });
    }
  });

  app.delete("/api/models/:modelId/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const success = await storage.removeUserLike(userId, modelId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing like:", error);
      res.status(500).json({ error: "Failed to remove like" });
    }
  });

  // Statistics endpoints
  app.get("/api/statistics/dashboard", async (req, res) => {
    try {
      const stats = await statisticsController.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}