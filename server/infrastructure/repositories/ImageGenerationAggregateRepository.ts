import { ImageGenerationAggregate, ImageGenerationStatus } from '../../domain/aggregates/ImageGenerationAggregate';
import { ImageDimensions } from '../../domain/value-objects/ImageDimensions';
import { Prompt } from '../../domain/value-objects/Prompt';
import { ImageGenerationOptions } from '../../domain/value-objects/ImageGenerationOptions';
import { IImageGenerationAggregateRepository } from '../../domain/repositories/IImageGenerationAggregateRepository';
import { db } from '../db';
import { generatedImages } from '../../../shared/schema';
import { eq, desc, asc } from 'drizzle-orm';

/**
 * Repository implementation for Image Generation Aggregate
 * Handles persistence and reconstruction of aggregates
 * Follows Apple's philosophy of reliable, efficient data management
 */
export class ImageGenerationAggregateRepository implements IImageGenerationAggregateRepository {
  
  async save(aggregate: ImageGenerationAggregate): Promise<ImageGenerationAggregate> {
    try {
      const existingRecord = await this.findDatabaseRecordById(aggregate.id);
      
      const data = {
        prompt: aggregate.prompt.value,
        negativePrompt: aggregate.negativePrompt.value,
        aspectRatio: aggregate.dimensions.aspectRatio,
        imageUrl: aggregate.imageUrls.join(','), // Store as comma-separated for now
        fileName: `${aggregate.id}.png`,
        fileSize: null,
        seed: aggregate.options.seed || null
      };

      if (existingRecord) {
        // Update existing record
        await db
          .update(generatedImages)
          .set(data)
          .where(eq(generatedImages.id, existingRecord.id));
      } else {
        // Insert new record
        await db.insert(generatedImages).values(data);
      }

      return aggregate;

    } catch (error: any) {
      throw new Error(`Failed to save image generation aggregate: ${error.message}`);
    }
  }

  async findById(id: string): Promise<ImageGenerationAggregate | null> {
    try {
      const records = await db
        .select()
        .from(generatedImages)
        .where(eq(generatedImages.fileName, `${id}.png`))
        .limit(1);

      if (records.length === 0) {
        return null;
      }

      return this.reconstructAggregate(id, records[0]);

    } catch (error: any) {
      throw new Error(`Failed to find image generation aggregate: ${error.message}`);
    }
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<ImageGenerationAggregate[]> {
    try {
      const records = await db
        .select()
        .from(generatedImages)
        .orderBy(desc(generatedImages.createdAt))
        .limit(limit)
        .offset(offset);

      return records.map((record, index) => 
        this.reconstructAggregate(`img_${record.id}`, record)
      );

    } catch (error: any) {
      throw new Error(`Failed to find image generation aggregates: ${error.message}`);
    }
  }

  async findByStatus(status: string, limit: number = 50): Promise<ImageGenerationAggregate[]> {
    // For now, we'll determine status based on imageUrl presence
    // In a full implementation, we'd add a status column
    try {
      const records = await db
        .select()
        .from(generatedImages)
        .orderBy(desc(generatedImages.createdAt))
        .limit(limit);

      const aggregates = records.map((record, index) => 
        this.reconstructAggregate(`img_${record.id}`, record)
      );

      return aggregates.filter(aggregate => aggregate.status === status);

    } catch (error: any) {
      throw new Error(`Failed to find image generation aggregates by status: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(generatedImages)
        .where(eq(generatedImages.fileName, `${id}.png`));

      return true; // Drizzle doesn't return affected rows count easily

    } catch (error: any) {
      throw new Error(`Failed to delete image generation aggregate: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const records = await db
        .select()
        .from(generatedImages)
        .where(eq(generatedImages.fileName, `${id}.png`))
        .limit(1);

      return records.length > 0;

    } catch (error: any) {
      throw new Error(`Failed to check if image generation aggregate exists: ${error.message}`);
    }
  }

  private async findDatabaseRecordById(aggregateId: string): Promise<any> {
    const records = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.fileName, `${aggregateId}.png`))
      .limit(1);

    return records.length > 0 ? records[0] : null;
  }

  private reconstructAggregate(id: string, record: any): ImageGenerationAggregate {
    try {
      // Reconstruct value objects
      const dimensions = ImageDimensions.fromAspectRatio(record.aspectRatio || "1:1");
      const options = ImageGenerationOptions.create({
        seed: record.seed || undefined,
        numberResults: 1,
        outputType: 'URL',
        outputFormat: 'PNG'
      });

      // Create aggregate
      const aggregate = ImageGenerationAggregate.create(
        id,
        record.prompt,
        record.negativePrompt || '',
        dimensions,
        options,
        "runware:100@1"
      );

      // If we have image URLs, mark as completed
      if (record.imageUrl && record.imageUrl.trim()) {
        const imageUrls = record.imageUrl.split(',').filter((url: string) => url.trim());
        if (imageUrls.length > 0) {
          const taskUUID = this.generateTaskUUID();
          aggregate.startGeneration(taskUUID);
          aggregate.completeGeneration(imageUrls);
        }
      }

      return aggregate;

    } catch (error: any) {
      throw new Error(`Failed to reconstruct aggregate: ${error.message}`);
    }
  }

  private generateTaskUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}