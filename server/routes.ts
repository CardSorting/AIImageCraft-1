import type { Express } from "express";
import { createServer, type Server } from "http";
import pkg from "express-openid-connect";
const { requiresAuth } = pkg;
import { ImageController } from "./presentation/controllers/ImageController";
import { StatisticsController } from "./presentation/controllers/StatisticsController";
import { storage } from "./storage";
import { pool } from "./infrastructure/db";
import Stripe from "stripe";
import { nanoid } from "nanoid";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to get or create user from Auth0
export async function getOrCreateUserFromAuth0(oidcUser: any): Promise<number> {
  if (!oidcUser) {
    throw new Error('User not authenticated');
  }
  
  // Try to find existing user by Auth0 ID
  let user = await storage.getUserByAuth0Id(oidcUser.sub);
  
  if (!user) {
    // Create new user if doesn't exist
    user = await storage.createUser({
      username: oidcUser.sub, // Using Auth0 sub as unique identifier
      password: 'auth0-user', // Placeholder since Auth0 handles authentication
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
  app.get("/api/auth/profile", async (req, res) => {
    if (req.oidc.isAuthenticated()) {
      try {
        const userId = await getOrCreateUserFromAuth0(req.oidc.user);
        res.json({
          isAuthenticated: true,
          user: req.oidc.user,
          userId: userId
        });
      } catch (error) {
        console.error("Error getting user ID:", error);
        res.json({
          isAuthenticated: true,
          user: req.oidc.user,
          userId: 3 // fallback to default authenticated user
        });
      }
    } else {
      res.json({
        isAuthenticated: false,
        user: null,
        userId: null
      });
    }
  });

  // Advanced Credit Transaction System - SOLID Principles + Clean Architecture
  app.post("/api/generate-images", async (req, res) => {
    try {
      console.log("[Credit System] Generate images endpoint called");
      console.log("[Credit System] Request body:", { prompt: req.body.prompt?.substring(0, 50) + "...", aspectRatio: req.body.aspectRatio });
      
      // For now, allow unauthenticated users with a default user ID for testing
      let userId = 1; // Default user for testing
      let isAuthenticated = false;
      
      if (req.oidc && req.oidc.isAuthenticated()) {
        console.log("[Credit System] User is authenticated");
        userId = await getOrCreateUserFromAuth0(req.oidc.user);
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
      
      res.json({
        success: true,
        images: result.images,
        requestId: result.requestId,
        creditsUsed: result.creditsUsed,
        newBalance: result.newBalance,
        isAuthenticated,
        ...(enhancementResults && {
          promptEnhancement: {
            originalPrompt: prompt,
            enhancedPrompt: finalPrompt,
            allVersions: enhancementResults
          }
        })
      });
      
    } catch (error: any) {
      console.error("Advanced credit transaction error:", error);
      res.status(500).json({ 
        error: "Transaction failed", 
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Advanced Credit Management Endpoints - Full Featured Implementation
  
  // Get user credit balance with transaction history
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
          [userId, '20.0', 1]
        );
        balance = 20;
        accountInfo = {
          balance: 20,
          version: 1,
          lastUpdated: new Date()
        };
      }
      
      // Get recent transactions
      const transactionsResult = await pool.query(
        'SELECT id, type, amount, description, balance_after, created_at FROM credit_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
        [userId]
      );
      
      res.json({
        balance,
        accountInfo,
        recentTransactions: transactionsResult.rows.map(row => ({
          id: row.id,
          type: row.type,
          amount: parseFloat(row.amount),
          description: row.description,
          balanceAfter: parseFloat(row.balance_after),
          createdAt: row.created_at
        }))
      });
      
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      res.status(500).json({ error: "Failed to fetch credit balance" });
    }
  });
  
  // Credit transaction history with pagination
  app.get("/api/credits/transactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, type } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let query = 'SELECT id, type, amount, description, balance_after, created_at FROM credit_transactions WHERE user_id = $1';
      let queryParams = [userId];
      
      if (type) {
        query += ' AND type = $2';
        queryParams.push(type as string);
      }
      
      query += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
      queryParams.push(limit.toString(), offset.toString());
      
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM credit_transactions WHERE user_id = $1';
      let countParams = [userId];
      
      if (type) {
        countQuery += ' AND type = $2';
        countParams.push(type as string);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);
      
      res.json({
        transactions: result.rows.map(row => ({
          id: row.id,
          type: row.type,
          amount: parseFloat(row.amount),
          description: row.description,
          balanceAfter: parseFloat(row.balance_after),
          createdAt: row.created_at
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / Number(limit))
        }
      });
      
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      res.status(500).json({ error: "Failed to fetch credit transactions" });
    }
  });
  
  // Credit analytics and insights
  app.get("/api/credits/analytics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { period = '30d' } = req.query;
      
      let dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
      if (period === '7d') dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
      if (period === '90d') dateFilter = "created_at >= NOW() - INTERVAL '90 days'";
      
      // Spending analytics
      const spendingResult = await pool.query(
        `SELECT 
          DATE(created_at) as date,
          SUM(CASE WHEN type = 'SPEND' THEN ABS(amount::numeric) ELSE 0 END) as spent,
          COUNT(CASE WHEN type = 'SPEND' THEN 1 END) as transactions
        FROM credit_transactions 
        WHERE user_id = $1 AND ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC`,
        [userId]
      );
      
      // Total statistics
      const statsResult = await pool.query(
        `SELECT 
          SUM(CASE WHEN type = 'SPEND' THEN ABS(amount::numeric) ELSE 0 END) as total_spent,
          SUM(CASE WHEN type = 'PURCHASE' THEN amount::numeric ELSE 0 END) as total_purchased,
          SUM(CASE WHEN type = 'REFUND' THEN amount::numeric ELSE 0 END) as total_refunded,
          COUNT(CASE WHEN type = 'SPEND' THEN 1 END) as total_generations
        FROM credit_transactions 
        WHERE user_id = $1 AND ${dateFilter}`,
        [userId]
      );
      
      const stats = statsResult.rows[0] || {};
      
      res.json({
        period,
        dailySpending: spendingResult.rows.map(row => ({
          date: row.date,
          spent: parseFloat(row.spent || 0),
          transactions: parseInt(row.transactions || 0)
        })),
        summary: {
          totalSpent: parseFloat(stats.total_spent || 0),
          totalPurchased: parseFloat(stats.total_purchased || 0),
          totalRefunded: parseFloat(stats.total_refunded || 0),
          totalGenerations: parseInt(stats.total_generations || 0),
          averagePerGeneration: stats.total_generations > 0 
            ? parseFloat(stats.total_spent || 0) / parseInt(stats.total_generations || 1)
            : 0
        }
      });
      
    } catch (error) {
      console.error("Error fetching credit analytics:", error);
      res.status(500).json({ error: "Failed to fetch credit analytics" });
    }
  });

  // Advanced Credit Purchase System - Stripe Integration with Full Features
  
  // Get available credit packages
  app.get("/api/credits/packages", async (req, res) => {
    try {
      const packagesResult = await pool.query(
        'SELECT id, name, credits, price, bonus_credits, is_active, display_order, metadata FROM credit_packages WHERE is_active = 1 ORDER BY display_order ASC'
      );
      
      res.json({
        packages: packagesResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          credits: row.credits,
          price: parseFloat(row.price),
          bonusCredits: row.bonus_credits,
          isActive: row.is_active === 1,
          displayOrder: row.display_order,
          metadata: row.metadata ? JSON.parse(row.metadata) : {},
          totalCredits: row.credits + row.bonus_credits,
          valuePerCredit: parseFloat(row.price) / (row.credits + row.bonus_credits)
        }))
      });
      
    } catch (error) {
      console.error("Error fetching credit packages:", error);
      res.status(500).json({ error: "Failed to fetch credit packages" });
    }
  });
  
  // Create Stripe payment intent for credit purchase
  app.post("/api/credits/purchase/intent", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = await getOrCreateUserFromAuth0(req.oidc.user);
      const { packageId } = req.body;
      
      // Get package details
      const packageResult = await pool.query(
        'SELECT id, name, credits, price, bonus_credits FROM credit_packages WHERE id = $1 AND is_active = 1',
        [packageId]
      );
      
      if (packageResult.rows.length === 0) {
        return res.status(404).json({ error: "Credit package not found" });
      }
      
      const creditPackage = packageResult.rows[0];
      const totalCredits = creditPackage.credits + creditPackage.bonus_credits;
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(creditPackage.price) * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          packageId: packageId,
          credits: creditPackage.credits.toString(),
          bonusCredits: creditPackage.bonus_credits.toString(),
          totalCredits: totalCredits.toString()
        },
        description: `Credit Purchase: ${creditPackage.name} (${totalCredits} credits)`
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        package: {
          id: creditPackage.id,
          name: creditPackage.name,
          credits: creditPackage.credits,
          bonusCredits: creditPackage.bonus_credits,
          totalCredits,
          price: parseFloat(creditPackage.price)
        }
      });
      
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  
  // Process successful credit purchase using the new Credit Domain System
  app.post("/api/credits/purchase/confirm", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = await getOrCreateUserFromAuth0(req.oidc.user);
      const { paymentIntentId } = req.body;
      
      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment not completed" });
      }
      
      if (parseInt(paymentIntent.metadata.userId) !== userId) {
        return res.status(403).json({ error: "Payment does not belong to this user" });
      }
      
      // Check if this payment has already been processed
      const existingTransaction = await pool.query(
        'SELECT id FROM credit_transactions WHERE description LIKE $1',
        [`%Payment Intent: ${paymentIntentId}%`]
      );
      
      if (existingTransaction.rows.length > 0) {
        return res.status(409).json({ error: "Payment already processed" });
      }
      
      // Add credits using the new Domain-Driven Design Stripe Payment Service
      const { StripePaymentService } = await import("./application/services/StripePaymentService");
      const paymentService = new StripePaymentService();
      
      const result = await paymentService.confirmPayment({
        paymentIntentId,
        userId
      });
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }
      
      res.json({
        success: true,
        message: "Credits added successfully",
        creditsAdded: result.creditsAdded,
        newBalance: result.newBalance,
        transactionId: result.transactionId
      });
      
    } catch (error: any) {
      console.error("Error processing credit purchase:", error);
      res.status(500).json({ 
        error: "Failed to process purchase", 
        message: error.message || "An unexpected error occurred"
      });
    }
  });
  
  // Enhanced Stripe payment intent creation with new credit system metadata
  app.post("/api/credits/purchase/intent", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = await getOrCreateUserFromAuth0(req.oidc.user);
      const { packageId } = req.body;
      
      // Get package details
      const packageResult = await pool.query(
        'SELECT id, name, credits, price, bonus_credits FROM credit_packages WHERE id = $1 AND is_active = 1',
        [packageId]
      );
      
      if (packageResult.rows.length === 0) {
        return res.status(404).json({ error: "Credit package not found" });
      }
      
      const creditPackage = packageResult.rows[0];
      const totalCredits = creditPackage.credits + creditPackage.bonus_credits;
      
      // Create Stripe payment intent with enhanced metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(creditPackage.price) * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          packageId: packageId,
          packageName: creditPackage.name,
          credits: creditPackage.credits.toString(),
          bonusCredits: creditPackage.bonus_credits.toString(),
          totalCredits: totalCredits.toString(),
          creditSystemVersion: "2.0"
        },
        description: `Credit Purchase: ${creditPackage.name} (${totalCredits} credits)`
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        package: {
          id: creditPackage.id,
          name: creditPackage.name,
          credits: creditPackage.credits,
          bonusCredits: creditPackage.bonus_credits,
          totalCredits,
          price: parseFloat(creditPackage.price)
        }
      });
      
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Failed to create payment intent", 
        message: error.message || "An unexpected error occurred"
      });
    }
  });
  
  // Credit spending estimation and cost calculator
  app.post("/api/credits/estimate", async (req, res) => {
    try {
      const { aspectRatio = "1:1", numImages = 1, operations = [] } = req.body;
      
      // Import domain service for accurate cost calculation
      const { CreditDomainService } = await import("./domain/CreditAggregate");
      const domainService = new CreditDomainService();
      
      const imageGenerationCost = domainService.calculateImageGenerationCost(aspectRatio, numImages);
      
      // Calculate additional operation costs (future extensibility)
      let totalOperationCost = 0;
      const operationBreakdown = [];
      
      for (const operation of operations) {
        let operationCost = 0;
        switch (operation.type) {
          case 'upscale':
            operationCost = 2; // 2 credits per upscale
            break;
          case 'variation':
            operationCost = 1; // 1 credit per variation
            break;
          case 'inpaint':
            operationCost = 1.5; // 1.5 credits per inpainting
            break;
          default:
            operationCost = 1;
        }
        
        totalOperationCost += operationCost;
        operationBreakdown.push({
          type: operation.type,
          cost: operationCost
        });
      }
      
      const totalCost = imageGenerationCost + totalOperationCost;
      
      res.json({
        breakdown: {
          imageGeneration: {
            aspectRatio,
            numImages,
            cost: imageGenerationCost
          },
          operations: operationBreakdown,
          total: totalCost
        },
        estimation: {
          lowQuality: Math.ceil(totalCost * 0.8),
          standard: totalCost,
          highQuality: Math.ceil(totalCost * 1.5)
        }
      });
      
    } catch (error) {
      console.error("Error calculating credit estimate:", error);
      res.status(500).json({ error: "Failed to calculate cost estimate" });
    }
  });

  // Prompt Enhancement endpoint
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      console.log("[Prompt Enhancement] Enhancement endpoint called");
      const { prompt, promptMaxLength = 64, promptVersions = 1 } = req.body;
      
      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({
          error: "Prompt is required for enhancement"
        });
      }

      console.log("[Prompt Enhancement] Request:", { 
        prompt: prompt.substring(0, 50) + "...", 
        maxLength: promptMaxLength, 
        versions: promptVersions 
      });

      // Import and use the Runware Prompt Enhancement Service
      const { RunwarePromptEnhancementService } = await import("./infrastructure/services/RunwarePromptEnhancementService");
      const enhancementService = new RunwarePromptEnhancementService();
      
      const result = await enhancementService.enhancePrompt({
        prompt,
        promptMaxLength,
        promptVersions
      });
      
      console.log("[Prompt Enhancement] Enhancement successful:", { 
        versionsGenerated: result.length,
        totalCost: result.reduce((sum, r) => sum + (r.cost || 0), 0)
      });
      
      res.json({
        success: true,
        enhancedPrompts: result,
        originalPrompt: prompt
      });
      
    } catch (error: any) {
      console.error("Prompt enhancement error:", error);
      res.status(500).json({ 
        error: "Enhancement failed", 
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Public endpoint for all images (home page)
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

  // User-specific endpoint for authenticated user's images
  app.get("/api/images/my", async (req, res) => {
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

  // Credit system API endpoints
  app.get("/api/credit-packages", async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, credits, price, bonus_credits, metadata FROM credit_packages WHERE is_active = 1 ORDER BY display_order'
      );
      
      const packages = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        credits: row.credits,
        price: parseFloat(row.price),
        bonusCredits: row.bonus_credits,
        metadata: row.metadata ? JSON.parse(row.metadata) : {}
      }));
      
      res.json({ packages });
    } catch (error: any) {
      console.error('Error fetching credit packages:', error);
      res.status(500).json({ error: 'Failed to fetch credit packages' });
    }
  });

  // Legacy endpoint - redirect to main credits endpoint
  app.get("/api/credit-balance/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Use the same logic as the main credits endpoint for consistency
      const balanceResult = await pool.query(
        'SELECT amount, version, last_updated FROM credit_balances WHERE user_id = $1',
        [userId]
      );
      
      let balance = 0;
      if (balanceResult.rows.length > 0) {
        balance = parseFloat(balanceResult.rows[0].amount);
      } else {
        // Create initial balance for new user
        await pool.query(
          'INSERT INTO credit_balances (user_id, amount) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
          [userId, '20']
        );
        balance = 20;
      }
      
      res.json({ balance });
    } catch (error: any) {
      console.error('Error fetching credit balance:', error);
      res.status(500).json({ error: 'Failed to fetch credit balance' });
    }
  });

  // Domain-Driven Design Payment Intent Endpoint
  app.post("/api/payments/intent", async (req, res) => {
    console.log("[Payment] Creating payment intent with DDD architecture");
    
    try {
      // Get authenticated user ID using consistent authentication logic
      let userId = 1; // Default for testing
      if (req.oidc && req.oidc.isAuthenticated()) {
        userId = await getOrCreateUserFromAuth0(req.oidc.user);
      }
      
      const { amount, packageId } = req.body;
      
      if (!amount || !packageId) {
        return res.status(400).json({ error: "Amount and package ID are required" });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Stripe not configured" });
      }
      
      // Use the new Domain-Driven Design Stripe Payment Service
      const { StripePaymentService } = await import("./application/services/StripePaymentService");
      const paymentService = new StripePaymentService();
      
      const result = await paymentService.createPaymentIntent({
        packageId,
        userId,
        amount
      });
      
      if (result.success) {
        res.json({
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId
        });
      } else {
        res.status(400).json({ error: result.error });
      }
      
    } catch (error: any) {
      console.error("[Payment] Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Error creating payment intent: " + error.message 
      });
    }
  });
  
  // Domain-Driven Design Payment Confirmation Endpoint
  app.post("/api/payments/confirm", async (req, res) => {
    console.log("[Payment] Confirming payment with DDD architecture");
    
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID required" });
      }
      
      // Get authenticated user ID using consistent authentication logic
      let userId = 1; // Default for testing
      if (req.oidc && req.oidc.isAuthenticated()) {
        userId = await getOrCreateUserFromAuth0(req.oidc.user);
      }
      
      // Use the new Domain-Driven Design Stripe Payment Service
      const { StripePaymentService } = await import("./application/services/StripePaymentService");
      const paymentService = new StripePaymentService();
      
      const result = await paymentService.confirmPayment({
        paymentIntentId,
        userId
      });
      
      if (result.success) {
        res.json({
          success: true,
          message: "Credits added successfully",
          creditsAdded: result.creditsAdded,
          newBalance: result.newBalance,
          transactionId: result.transactionId
        });
      } else {
        res.status(400).json({ error: result.error });
      }
      
    } catch (error: any) {
      console.error("[Payment] Error confirming payment:", error);
      res.status(500).json({ 
        error: "Payment confirmation failed", 
        message: error.message 
      });
    }
  });
  
  // Legacy endpoint for backward compatibility
  app.post("/api/create-payment-intent", async (req, res) => {
    // Redirect to new DDD endpoint
    req.url = "/api/payments/intent";
    return app._router.handle(req, res);
  });

  // Add credits to user account after successful payment
  app.post("/api/add-credits", async (req, res) => {
    try {
      const { userId, packageId, amount } = req.body;
      
      if (!userId || !packageId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get package details from database
      const packageResult = await pool.query(
        'SELECT credits, bonus_credits FROM credit_packages WHERE id = $1',
        [packageId]
      );
      
      if (packageResult.rows.length === 0) {
        return res.status(404).json({ error: 'Package not found' });
      }
      
      const package_data = packageResult.rows[0];
      const totalCredits = package_data.credits + (package_data.bonus_credits || 0);
      
      // Add credits to user's balance
      await pool.query(`
        INSERT INTO credit_balances (user_id, amount) 
        VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET amount = credit_balances.amount + EXCLUDED.amount
      `, [userId, totalCredits]);
      
      // Get the updated balance
      const balanceResult = await pool.query('SELECT amount FROM credit_balances WHERE user_id = $1', [userId]);
      const newBalance = balanceResult.rows[0]?.amount || totalCredits;
      
      // Record the transaction
      const { nanoid } = await import('nanoid');
      await pool.query(`
        INSERT INTO credit_transactions (id, user_id, type, amount, description, metadata, balance_after)
        VALUES ($1, $2, 'purchase', $3, $4, $5, $6)
      `, [
        nanoid(),
        userId, 
        totalCredits, 
        `Purchased ${package_data.credits} credits`,
        JSON.stringify({ packageId, paymentAmount: amount }),
        newBalance
      ]);
      
      // Add cache-busting header to force frontend refresh
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json({ 
        success: true, 
        creditsAdded: totalCredits,
        newBalance: parseFloat(newBalance),
        userId: userId,
        message: `Successfully added ${totalCredits} credits to your account`
      });
    } catch (error: any) {
      console.error('Error adding credits:', error);
      res.status(500).json({ error: 'Failed to add credits' });
    }
  });

  // Webhook endpoint for Stripe events (also accessible at /webhook/stripe)
  const handleStripeWebhook = async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('Webhook secret not configured');
      }
      event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful via webhook!');
        
        // Add credits to user account
        const packageId = paymentIntent.metadata?.packageId;
        const amount = paymentIntent.amount / 100; // Convert from cents
        
        if (packageId) {
          console.log('Adding credits for package:', packageId);
          
          // Get the actual user ID from payment intent metadata
          const userId = paymentIntent.metadata?.userId ? parseInt(paymentIntent.metadata.userId) : null;
          
          if (!userId) {
            console.error('No userId found in payment intent metadata:', paymentIntent.metadata);
            break;
          }
          
          console.log(`Processing payment for user ID: ${userId}`);
          
          try {
            // Get package details from database
            const packageResult = await pool.query(
              'SELECT credits, bonus_credits FROM credit_packages WHERE id = $1',
              [packageId]
            );
            
            if (packageResult.rows.length > 0) {
              const package_data = packageResult.rows[0];
              const totalCredits = package_data.credits + (package_data.bonus_credits || 0);
              
              // Add credits to user's balance
              await pool.query(`
                INSERT INTO credit_balances (user_id, amount) 
                VALUES ($1, $2)
                ON CONFLICT (user_id) 
                DO UPDATE SET amount = credit_balances.amount + EXCLUDED.amount
              `, [userId, totalCredits]);
              
              // Get the updated balance
              const balanceResult = await pool.query('SELECT amount FROM credit_balances WHERE user_id = $1', [userId]);
              const newBalance = balanceResult.rows[0]?.amount || totalCredits;
              
              // Record the transaction
              const { nanoid } = await import('nanoid');
              await pool.query(`
                INSERT INTO credit_transactions (id, user_id, type, amount, description, metadata, balance_after)
                VALUES ($1, $2, 'purchase', $3, $4, $5, $6)
              `, [
                nanoid(),
                userId, 
                totalCredits, 
                `Purchased ${package_data.credits} credits via webhook`,
                JSON.stringify({ packageId, paymentAmount: amount, paymentIntentId: paymentIntent.id }),
                newBalance
              ]);
              
              console.log(`Successfully added ${totalCredits} credits to user ${userId} via webhook`);
            } else {
              console.error('Package not found:', packageId);
            }
          } catch (error) {
            console.error('Error adding credits via webhook:', error);
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  };

  // Register webhook handlers for both routes
  app.post('/api/webhook', handleStripeWebhook);
  app.post('/webhook/stripe', handleStripeWebhook);

  const httpServer = createServer(app);
  return httpServer;
}
