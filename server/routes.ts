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

  // Advanced Credit Transaction System - Image Generation
  app.post("/api/generate-images", async (req, res) => {
    try {
      console.log("[Credit System] Generate images endpoint called");
      console.log("[Credit System] Request body:", { prompt: req.body.prompt?.substring(0, 50) + "...", aspectRatio: req.body.aspectRatio });
      
      // Allow unauthenticated users with a default user ID for testing
      let userId = "default-user"; // Default user for testing
      let isAuthenticated = false;
      
      if (req.user?.claims?.sub) {
        console.log("[Credit System] User is authenticated");
        userId = getUserIdFromReplit(req);
        isAuthenticated = true;
      } else {
        console.log("[Credit System] Using default user ID for testing:", userId);
      }
      
      const { prompt, negativePrompt = "", aspectRatio = "1:1", numImages = 1, model, enhancePrompt = false, promptMaxLength = 64, promptVersions = 1 } = req.body;
      
      // Import and use the full-featured Credit Transaction Service
      const { CreditTransactionService } = await import("./application/services/CreditTransactionService");
      const creditService = new CreditTransactionService();
      
      console.log("[Credit System] Executing credit transaction for user:", userId);
      
      // Handle prompt enhancement if requested (temporarily disabled due to SDK issues)
      let finalPrompt = prompt;
      let enhancementResults = null;
      
      if (enhancePrompt && prompt.trim().length > 0) {
        console.log("[Prompt Enhancement] Prompt enhancement temporarily disabled - using original prompt");
        // Skip enhancement for now to avoid API issues
      }
      
      // Execute atomic credit transaction with image generation
      const result = await creditService.executeImageGenerationTransaction({
        userId,
        prompt: finalPrompt,
        negativePrompt,
        aspectRatio,
        numImages,
        model
      });
      
      console.log("[Credit System] Transaction result:", { 
        success: result.success, 
        error: result.error,
        creditsUsed: result.creditsUsed,
        newBalance: result.newBalance
      });
      
      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          error: result.error,
          message: result.message,
          required: result.required,
          available: result.available
        });
      }
      
      const response: any = {
        success: true,
        images: result.images,
        requestId: result.requestId,
        creditsUsed: result.creditsUsed,
        newBalance: result.newBalance,
        isAuthenticated
      };

      if (enhancementResults) {
        response.promptEnhancement = {
          originalPrompt: prompt,
          enhancedPrompt: finalPrompt,
          allVersions: enhancementResults
        };
      }

      res.json(response);
      
    } catch (error: any) {
      console.error("Advanced credit transaction error:", error);
      res.status(500).json({ 
        error: "Transaction failed", 
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Get all images (public endpoint)
  app.get("/api/images", async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const images = await storage.getImages(limit);
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  // Get images for authenticated user only
  app.get("/api/images/my", async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = getUserIdFromReplit(req);
      const limit = parseInt(req.query.limit as string) || 50;
      const images = await storage.getImagesByUserId(userId, limit);
      res.json(images);
    } catch (error) {
      console.error("Error fetching user images:", error);
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

  // Advanced Credit Management Endpoints
  app.get("/api/credits/balance/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get current balance
      const balanceResult = await pool.query(
        'SELECT amount, version, last_updated FROM credit_balances WHERE user_id = $1',
        [userId]
      );
      
      let balance = 0;
      let accountInfo = null;
      
      if (balanceResult.rows.length > 0) {
        const row = balanceResult.rows[0];
        balance = parseFloat(row.amount);
        accountInfo = {
          balance,
          version: row.version,
          lastUpdated: row.last_updated
        };
      } else {
        // Create initial balance for new user
        await pool.query(
          'INSERT INTO credit_balances (user_id, amount, version, last_updated) VALUES ($1, $2, $3, NOW())',
          [userId, '50.0', 1]
        );
        balance = 50.0;
        accountInfo = {
          balance: 50.0,
          version: 1,
          lastUpdated: new Date()
        };
      }
      
      // Get recent transaction history
      const transactionResult = await pool.query(
        'SELECT transaction_type, amount, description, created_at FROM credit_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
        [userId]
      );
      
      res.json({
        balance,
        accountInfo,
        recentTransactions: transactionResult.rows
      });
      
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      res.status(500).json({ error: "Failed to fetch credit balance" });
    }
  });

  // Credit management endpoint for authenticated users
  app.get("/api/credits/balance", async (req: any, res) => {
    try {
      let userId = "default-user";
      
      if (req.user?.claims?.sub) {
        userId = getUserIdFromReplit(req);
      }
      
      const balanceResult = await pool.query(
        'SELECT amount FROM credit_balances WHERE user_id = $1',
        [userId]
      );
      const balance = balanceResult.rows[0]?.amount || 50;
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
  app.get("/api/chat/sessions", async (req: any, res) => {
    try {
      if (req.user?.claims?.sub) {
        const userId = getUserIdFromReplit(req);
        const sessions = await storage.getChatSessions(userId, 50);
        res.json(sessions);
      } else {
        res.json([]); // Return empty array for unauthenticated users
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = getUserIdFromReplit(req);
      const { title, previewImage } = req.body;
      
      const session = await storage.createChatSession({
        id: nanoid(),
        userId,
        title: title || "New Chat",
        previewImage: previewImage || null,
        messageCount: 0
      });
      
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Individual image endpoints
  app.get("/api/images/:id", async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      
      // Validate that imageId is a valid number
      if (isNaN(imageId) || imageId <= 0) {
        return res.status(400).json({ error: "Invalid image ID" });
      }
      
      const image = await storage.getImageById(imageId);
      
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });

  app.delete("/api/images/:id", async (req: any, res) => {
    try {
      const imageId = parseInt(req.params.id);
      
      // Validate that imageId is a valid number
      if (isNaN(imageId) || imageId <= 0) {
        return res.status(400).json({ error: "Invalid image ID" });
      }
      
      // Check if user owns the image or is admin
      if (req.user?.claims?.sub) {
        const userId = getUserIdFromReplit(req);
        const image = await storage.getImageById(imageId);
        
        if (!image || image.userId !== userId) {
          return res.status(403).json({ error: "Not authorized to delete this image" });
        }
      } else {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const success = await storage.deleteImage(imageId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Model browsing endpoints
  app.get("/api/models/:id", async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.getAIModelById(modelId);
      
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      
      res.json(model);
    } catch (error) {
      console.error("Error fetching model:", error);
      res.status(500).json({ error: "Failed to fetch model" });
    }
  });

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

  // User interaction endpoints (bookmarks, likes)
  app.post("/api/models/:modelId/bookmark", async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const bookmark = await storage.createUserBookmark({
        userId,
        modelId,
        createdAt: new Date()
      });
      
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  app.delete("/api/models/:modelId/bookmark", async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const success = await storage.removeUserBookmark(userId, modelId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });

  app.post("/api/models/:modelId/like", async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const like = await storage.createUserLike({
        userId,
        modelId,
        createdAt: new Date()
      });
      
      res.json(like);
    } catch (error) {
      console.error("Error creating like:", error);
      res.status(500).json({ error: "Failed to create like" });
    }
  });

  app.delete("/api/models/:modelId/like", async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = getUserIdFromReplit(req);
      const modelId = parseInt(req.params.modelId);
      
      const success = await storage.removeUserLike(userId, modelId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing like:", error);
      res.status(500).json({ error: "Failed to remove like" });
    }
  });

  // Check if model is bookmarked/liked
  app.get("/api/models/:modelId/status", async (req: any, res) => {
    try {
      const modelId = parseInt(req.params.modelId);
      
      if (req.user?.claims?.sub) {
        const userId = getUserIdFromReplit(req);
        const [isBookmarked, isLiked] = await Promise.all([
          storage.isModelBookmarked(userId, modelId),
          storage.isModelLiked(userId, modelId)
        ]);
        
        res.json({ isBookmarked, isLiked });
      } else {
        res.json({ isBookmarked: false, isLiked: false });
      }
    } catch (error) {
      console.error("Error checking model status:", error);
      res.status(500).json({ error: "Failed to check model status" });
    }
  });

  // Dashboard and statistics
  app.get("/api/dashboard/stats", async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = getUserIdFromReplit(req);
      
      // Basic stats implementation
      const [userImages, bookmarkedModels, chatSessions] = await Promise.all([
        storage.getImagesByUserId(userId, 100),
        storage.getBookmarkedModels(userId, 100),
        storage.getChatSessions(userId, 100)
      ]);
      
      const stats = {
        totalImages: userImages.length,
        totalBookmarks: bookmarkedModels.length,
        totalChats: chatSessions.length,
        recentActivity: userImages.slice(0, 5)
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Search functionality
  app.get("/api/search/models", async (req, res) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      
      const models = await storage.searchAIModels(query, limit);
      res.json(models);
    } catch (error) {
      console.error("Error searching models:", error);
      res.status(500).json({ error: "Failed to search models" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}