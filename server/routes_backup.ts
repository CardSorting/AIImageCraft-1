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

  const httpServer = createServer(app);
  return httpServer;
}