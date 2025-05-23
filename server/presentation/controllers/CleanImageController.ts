import { Request, Response } from 'express';
import { CleanArchitectureContainer } from '../../infrastructure/container/CleanArchitectureContainer';
import { CreateImageGenerationDTO, ImageGenerationResponseDTO, ImageHistoryQueryDTO } from '../../application/dto/ImageGenerationDTO';

/**
 * Clean Image Controller
 * Handles HTTP requests following Clean Architecture principles
 * Embodies Apple's philosophy of intuitive, user-focused interfaces
 */
export class CleanImageController {
  private container = CleanArchitectureContainer.getInstance();

  async generateImages(req: Request, res: Response): Promise<void> {
    try {
      const requestDto: CreateImageGenerationDTO = req.body;
      
      // Validate required fields
      if (!requestDto.prompt) {
        res.status(400).json({
          success: false,
          error: 'Prompt is required for image generation'
        });
        return;
      }

      console.log(`[CleanImageController] Generating images for prompt: ${requestDto.prompt.substring(0, 50)}...`);

      // Execute use case
      const result = await this.container.generateImageUseCase.execute({
        prompt: requestDto.prompt,
        negativePrompt: requestDto.negativePrompt,
        aspectRatio: requestDto.aspectRatio || "1:1",
        model: requestDto.model,
        options: {
          steps: requestDto.steps,
          cfgScale: requestDto.cfgScale,
          seed: requestDto.seed,
          scheduler: requestDto.scheduler,
          clipSkip: requestDto.clipSkip,
          promptWeighting: requestDto.promptWeighting,
          numberResults: requestDto.numberResults,
          outputType: requestDto.outputType,
          outputFormat: requestDto.outputFormat,
          outputQuality: requestDto.outputQuality,
          checkNSFW: requestDto.checkNSFW
        }
      });

      // Transform to response DTO
      const responseDto: ImageGenerationResponseDTO = {
        id: result.id,
        prompt: result.prompt,
        negativePrompt: requestDto.negativePrompt,
        status: result.status,
        imageUrls: result.imageUrls,
        dimensions: result.dimensions,
        model: requestDto.model || "runware:100@1",
        taskUUID: result.taskUUID,
        createdAt: result.createdAt.toISOString(),
        cost: result.cost,
        retryCount: 0
      };

      console.log(`[CleanImageController] Successfully generated ${result.imageUrls.length} images`);

      res.status(200).json({
        success: true,
        data: responseDto,
        requestId: result.id
      });

    } catch (error: any) {
      console.error(`[CleanImageController] Image generation failed:`, error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate images',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const queryDto: ImageHistoryQueryDTO = {
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
        status: req.query.status as string,
        sortBy: (req.query.sortBy as 'createdAt' | 'completedAt') || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      console.log(`[CleanImageController] Retrieving image history with params:`, queryDto);

      // Execute use case
      const result = await this.container.getImageHistoryUseCase.execute({
        limit: queryDto.limit,
        offset: queryDto.offset,
        status: queryDto.status,
        sortBy: queryDto.sortBy,
        sortOrder: queryDto.sortOrder
      });

      // Transform to response DTOs
      const responseDtos: ImageGenerationResponseDTO[] = result.items.map(item => ({
        id: item.id,
        prompt: item.prompt,
        status: item.status,
        imageUrls: item.imageUrls,
        dimensions: item.dimensions,
        model: "runware:100@1", // Default for now
        createdAt: item.createdAt.toISOString(),
        completedAt: item.completedAt?.toISOString(),
        duration: item.duration,
        cost: item.cost,
        retryCount: item.retryCount
      }));

      console.log(`[CleanImageController] Retrieved ${responseDtos.length} image history items`);

      res.status(200).json({
        success: true,
        data: {
          items: responseDtos,
          pagination: {
            total: result.total,
            limit: queryDto.limit || 50,
            offset: queryDto.offset || 0,
            hasMore: result.hasMore
          }
        }
      });

    } catch (error: any) {
      console.error(`[CleanImageController] Failed to retrieve image history:`, error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve image history',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async getImageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Image ID is required'
        });
        return;
      }

      console.log(`[CleanImageController] Retrieving image by ID: ${id}`);

      // Get aggregate from repository
      const aggregate = await this.container.imageAggregateRepository.findById(id);
      
      if (!aggregate) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }

      // Transform to response DTO
      const responseDto: ImageGenerationResponseDTO = {
        id: aggregate.id,
        prompt: aggregate.prompt.value,
        negativePrompt: aggregate.negativePrompt.value,
        status: aggregate.status,
        imageUrls: aggregate.imageUrls,
        dimensions: {
          width: aggregate.dimensions.width,
          height: aggregate.dimensions.height
        },
        model: aggregate.model,
        taskUUID: aggregate.taskUUID,
        createdAt: aggregate.createdAt.toISOString(),
        startedAt: aggregate.startedAt?.toISOString(),
        completedAt: aggregate.completedAt?.toISOString(),
        duration: aggregate.duration,
        cost: aggregate.cost,
        retryCount: aggregate.retryCount,
        error: aggregate.error
      };

      console.log(`[CleanImageController] Successfully retrieved image: ${id}`);

      res.status(200).json({
        success: true,
        data: responseDto
      });

    } catch (error: any) {
      console.error(`[CleanImageController] Failed to retrieve image:`, error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve image',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Image ID is required'
        });
        return;
      }

      console.log(`[CleanImageController] Deleting image: ${id}`);

      const deleted = await this.container.imageAggregateRepository.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Image not found'
        });
        return;
      }

      console.log(`[CleanImageController] Successfully deleted image: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });

    } catch (error: any) {
      console.error(`[CleanImageController] Failed to delete image:`, error.message);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete image',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}