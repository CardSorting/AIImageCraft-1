import { Request, Response } from 'express';
import { generateImageRequestSchema } from '@shared/schema';
import { GenerateImagesCommand } from '../../application/commands/GenerateImagesCommand';
import { GetImagesQuery } from '../../application/queries/GetImagesQuery';
import { GetImageByIdQuery } from '../../application/queries/GetImageByIdQuery';
import { DependencyContainer } from '../../infrastructure/container/DependencyContainer';

export class ImageController {
  private container = DependencyContainer.getInstance();

  async generateImages(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = generateImageRequestSchema.parse(req.body);
      
      const command = new GenerateImagesCommand(
        validatedData.prompt,
        validatedData.negativePrompt,
        validatedData.aspectRatio,
        validatedData.numImages
      );

      const images = await this.container.generateImagesCommandHandler.handle(command);
      
      res.json({
        success: true,
        images: images.map(img => img.toPlainObject()),
        requestId: `req_${Date.now()}`,
      });

    } catch (error: any) {
      console.error("Image generation error:", error);
      
      if (error.name === "ZodError") {
        res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        message: error.message || "Failed to generate images. Please try again.",
      });
    }
  }

  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const query = new GetImagesQuery(limit);
      
      const images = await this.container.getImagesQueryHandler.handle(query);
      
      res.json(images.map(img => img.toPlainObject()));
    } catch (error: any) {
      console.error("Error fetching images:", error);
      res.status(500).json({
        message: "Failed to fetch images",
      });
    }
  }

  async getImageById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const query = new GetImageByIdQuery(id);
      
      const image = await this.container.imageRepository.findById(id);
      
      if (!image) {
        res.status(404).json({
          message: "Image not found",
        });
        return;
      }

      res.json(image.toPlainObject());
    } catch (error: any) {
      console.error("Error fetching image:", error);
      res.status(500).json({
        message: "Failed to fetch image",
      });
    }
  }

  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.container.imageRepository.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          message: "Image not found",
        });
        return;
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting image:", error);
      res.status(500).json({
        message: "Failed to delete image",
      });
    }
  }
}