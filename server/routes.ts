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

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
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

  // Simplified image generation endpoint
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

  const httpServer = createServer(app);
  return httpServer;
}