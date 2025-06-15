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

  async generateCosplay(req: any, res: Response): Promise<void> {
    try {
      if (!req.isAuthenticated() || !req.user?.claims) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const userId = req.user.claims.sub;
      const { instruction } = req.body;
      const imageFile = req.file;

      if (!imageFile || !instruction) {
        res.status(400).json({ error: "Image and instruction are required" });
        return;
      }

      console.log(`[CosplayController] Processing cosplay transformation for user ${userId}`);
      console.log(`[CosplayController] Instruction: ${instruction.substring(0, 100)}...`);

      // Check and deduct credits first (0.5 credits for cosplay transformation)
      const COSPLAY_COST = 0.5;
      
      // Get current balance
      const currentBalance = await this.getCreditBalance(userId);
      console.log(`[CosplayController] User ${userId} current balance: ${currentBalance} credits`);
      
      if (currentBalance < COSPLAY_COST) {
        console.log(`[CosplayController] Insufficient credits - need ${COSPLAY_COST}, have ${currentBalance}`);
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
      console.log(`[CosplayController] Deducting ${COSPLAY_COST} credits from user ${userId}`);
      await this.deductCredits(userId, COSPLAY_COST, "AI Cosplay transformation");
      
      const newBalance = await this.getCreditBalance(userId);
      console.log(`[CosplayController] Credits deducted successfully. New balance: ${newBalance}`);

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
          negativePrompt: "",
          aspectRatio: "1:1",
          steps: "30",
          cfgScale: "7.0",
          scheduler: "DPMSolverMultistepScheduler",
          imageUrl: transformedImages[0].url,
          fileName: null,
          fileSize: null,
          seed: null,
          status: "completed",
          rarityTier: "COMMON",
          rarityScore: "50.0",
          rarityStars: 1,
          rarityLetter: "C"
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

  private async getCreditBalance(userId: string): Promise<number> {
    return await storage.getCreditBalance(userId);
  }

  private async deductCredits(userId: string, amount: number, description: string): Promise<void> {
    await storage.updateCredits(userId, -amount, description);
  }

  private async refundCredits(userId: string, amount: number, description: string): Promise<void> {
    await storage.updateCredits(userId, amount, description);
  }
}