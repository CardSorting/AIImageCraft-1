import { Request, Response } from 'express';
import { FalAICosplayService } from '../../infrastructure/services/FalAICosplayService';
import { storage } from '../../storage';
import { db, pool } from '../../db';
import { CreditTransactionService } from '../../application/services/CreditTransactionService';

/**
 * Cosplay Controller
 * Handles AI cosplay transformations using FAL AI FLUX.1 Kontext
 */
export class CosplayController {
  private falAIService = new FalAICosplayService();
  private creditService = new CreditTransactionService();

  async generateCosplay(req: Request, res: Response): Promise<void> {
    try {
      if (!req.oidc.isAuthenticated()) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const userId = await this.getOrCreateUserFromAuth0(req.oidc.user);
      const { instruction } = req.body;
      const imageFile = req.file;

      if (!imageFile || !instruction) {
        res.status(400).json({ error: "Image and instruction are required" });
        return;
      }

      console.log(`[CosplayController] Processing cosplay transformation for user ${userId}`);
      console.log(`[CosplayController] Instruction: ${instruction.substring(0, 100)}...`);

      // Check and deduct credits first (10 credits for cosplay transformation)
      const COSPLAY_COST = 10;
      
      // Get current balance
      const currentBalance = await this.getCreditBalance(userId);
      if (currentBalance < COSPLAY_COST) {
        res.status(402).json({
          success: false,
          error: "Insufficient credits",
          message: `Need ${COSPLAY_COST} credits for cosplay transformation`,
          required: COSPLAY_COST,
          available: currentBalance
        });
        return;
      }

      // Deduct credits before generation
      await this.deductCredits(userId, COSPLAY_COST, "AI Cosplay transformation");

      // Convert image buffer to base64 for FAL AI
      const imageBase64 = imageFile.buffer.toString('base64');
      const imageDataUri = `data:${imageFile.mimetype};base64,${imageBase64}`;

      try {
        // Transform the image using FAL AI
        const transformedImages = await this.falAIService.transformImage({
          imageUrl: imageDataUri,
          prompt: instruction,
          aspectRatio: "1:1",
          numImages: 1,
          guidanceScale: 3.5
        });

        if (!transformedImages || transformedImages.length === 0) {
          // Refund credits if no images generated
          await this.refundCredits(userId, COSPLAY_COST, "No images generated - refund");
          res.status(500).json({ 
            error: "No images generated",
            message: "The transformation service did not return any images. Credits have been refunded."
          });
          return;
        }

        // Store the generated image in database
        const generatedImage = await storage.createImage({
          userId: userId,
          modelId: "fal-ai/flux-pro/kontext",
          prompt: instruction,
          imageUrl: transformedImages[0].url,
          aspectRatio: "1:1",
          seed: null
        });

        console.log(`[CosplayController] Successfully generated cosplay image with ID: ${generatedImage.id}`);

        res.json({
          success: true,
          image: {
            id: generatedImage.id,
            url: transformedImages[0].url,
            width: transformedImages[0].width,
            height: transformedImages[0].height,
            prompt: instruction,
            model: "fal-ai/flux-pro/kontext",
            creditsUsed: COSPLAY_COST
          },
          message: "Cosplay transformation completed successfully"
        });

      } catch (generationError: any) {
        // Refund credits if image generation fails
        await this.refundCredits(userId, COSPLAY_COST, "Image generation failed - refund");
        console.error(`[CosplayController] Image generation failed:`, generationError.message);
        res.status(500).json({
          success: false,
          error: generationError.message || 'Image generation failed',
          message: "Credits have been refunded"
        });
        return;
      }

    } catch (error: any) {
      console.error(`[CosplayController] Cosplay generation failed:`, error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate cosplay transformation',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  private async getOrCreateUserFromAuth0(oidcUser: any): Promise<number> {
    if (!oidcUser?.sub) {
      throw new Error("Invalid Auth0 user data");
    }

    const auth0Id = oidcUser.sub;
    let user = await storage.getUserByAuth0Id(auth0Id);

    if (!user) {
      user = await storage.createUser({
        username: oidcUser.nickname || oidcUser.email?.split('@')[0] || 'user',
        password: '' // Auth0 handles authentication, no password needed
      });
    }

    return user.id;
  }

  private async getCreditBalance(userId: number): Promise<number> {
    try {
      const result = await pool.query(
        'SELECT amount FROM credit_balances WHERE user_id = $1',
        [userId]
      );
      return result.rows[0]?.amount || 0;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      return 0;
    }
  }

  private async deductCredits(userId: number, amount: number, description: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE credit_balances SET amount = amount - $1 WHERE user_id = $2',
        [amount, userId]
      );
      
      // Record transaction
      await pool.query(
        'INSERT INTO credit_transactions (id, user_id, type, amount, description, balance_after, created_at) VALUES ($1, $2, $3, $4, $5, (SELECT amount FROM credit_balances WHERE user_id = $2), NOW())',
        [`tx_${Date.now()}`, userId, 'SPEND', -amount, description]
      );
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw new Error('Failed to deduct credits');
    }
  }

  private async refundCredits(userId: number, amount: number, description: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE credit_balances SET amount = amount + $1 WHERE user_id = $2',
        [amount, userId]
      );
      
      // Record refund transaction
      await pool.query(
        'INSERT INTO credit_transactions (id, user_id, type, amount, description, balance_after, created_at) VALUES ($1, $2, $3, $4, $5, (SELECT amount FROM credit_balances WHERE user_id = $2), NOW())',
        [`tx_${Date.now()}`, userId, 'REFUND', amount, description]
      );
    } catch (error) {
      console.error('Error refunding credits:', error);
    }
  }
}