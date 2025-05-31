import { Request, Response } from 'express';
import { FalAICosplayService } from '../../infrastructure/services/FalAICosplayService';
import { storage } from '../../storage';

/**
 * Cosplay Controller
 * Handles AI cosplay transformations using FAL AI FLUX.1 Kontext
 */
export class CosplayController {
  private falAIService = new FalAICosplayService();

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

      // Convert image buffer to base64 for FAL AI
      const imageBase64 = imageFile.buffer.toString('base64');
      const imageDataUri = `data:${imageFile.mimetype};base64,${imageBase64}`;

      // Transform the image using FAL AI
      const transformedImages = await this.falAIService.transformImage({
        imageUrl: imageDataUri,
        prompt: instruction,
        aspectRatio: "1:1",
        numImages: 1,
        guidanceScale: 3.5
      });

      if (!transformedImages || transformedImages.length === 0) {
        res.status(500).json({ 
          error: "No images generated",
          message: "The transformation service did not return any images"
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
          model: "fal-ai/flux-pro/kontext"
        },
        message: "Cosplay transformation completed successfully"
      });

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
}