import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateImageRequestSchema } from "@shared/schema";
import { fal } from "@fal-ai/client";

// Configure FAL AI client
fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_AI_KEY || ""
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate images endpoint
  app.post("/api/generate-images", async (req, res) => {
    try {
      const validatedData = generateImageRequestSchema.parse(req.body);
      const { prompt, negativePrompt, aspectRatio, numImages } = validatedData;

      if (!process.env.FAL_KEY && !process.env.FAL_AI_KEY) {
        return res.status(500).json({ 
          message: "FAL AI API key not configured. Please set FAL_KEY environment variable." 
        });
      }

      // Generate images using FAL AI Imagen 4
      const result = await fal.subscribe("fal-ai/imagen4/preview", {
        input: {
          prompt,
          negative_prompt: negativePrompt || "",
          aspect_ratio: aspectRatio,
          num_images: numImages,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs?.map(log => log.message).join(", "));
          }
        },
      });

      // Store generated images in storage
      const storedImages = [];
      if (result.data && result.data.images) {
        for (const image of result.data.images) {
          const storedImage = await storage.createImage({
            prompt,
            negativePrompt: negativePrompt || "",
            aspectRatio,
            imageUrl: image.url,
            fileName: image.file_name || `generated-${Date.now()}.png`,
            fileSize: image.file_size || null,
            seed: result.data.seed || null,
          });
          storedImages.push(storedImage);
        }
      }

      res.json({
        success: true,
        images: storedImages,
        requestId: result.requestId,
      });

    } catch (error: any) {
      console.error("Image generation error:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: error.message || "Failed to generate images. Please try again.",
      });
    }
  });

  // Get generated images
  app.get("/api/images", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const images = await storage.getImages(limit);
      res.json(images);
    } catch (error: any) {
      console.error("Error fetching images:", error);
      res.status(500).json({
        message: "Failed to fetch images",
      });
    }
  });

  // Get specific image
  app.get("/api/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const image = await storage.getImageById(id);
      
      if (!image) {
        return res.status(404).json({
          message: "Image not found",
        });
      }

      res.json(image);
    } catch (error: any) {
      console.error("Error fetching image:", error);
      res.status(500).json({
        message: "Failed to fetch image",
      });
    }
  });

  // Delete image
  app.delete("/api/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteImage(id);
      
      if (!deleted) {
        return res.status(404).json({
          message: "Image not found",
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting image:", error);
      res.status(500).json({
        message: "Failed to delete image",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
