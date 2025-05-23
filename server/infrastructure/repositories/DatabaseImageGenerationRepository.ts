import { ImageGeneration } from '../../domain/entities/ImageGeneration';
import { IImageGenerationRepository } from '../../domain/repositories/IImageGenerationRepository';
import { db } from '../db';
import { generatedImages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export class DatabaseImageGenerationRepository implements IImageGenerationRepository {
  async save(imageGeneration: ImageGeneration): Promise<ImageGeneration> {
    const data = imageGeneration.toPlainObject();
    
    const [savedImage] = await db
      .insert(generatedImages)
      .values({
        prompt: data.prompt,
        negativePrompt: data.negativePrompt || "",
        aspectRatio: data.aspectRatio,
        imageUrl: data.imageUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        seed: data.seed,
      })
      .returning();

    return ImageGeneration.fromPersistence({
      id: savedImage.id,
      prompt: savedImage.prompt,
      negativePrompt: savedImage.negativePrompt || "",
      aspectRatio: savedImage.aspectRatio as any,
      imageUrl: savedImage.imageUrl,
      fileName: savedImage.fileName,
      fileSize: savedImage.fileSize,
      seed: savedImage.seed,
      createdAt: savedImage.createdAt,
    });
  }

  async findById(id: number): Promise<ImageGeneration | null> {
    const [image] = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, id));

    if (!image) return null;

    return ImageGeneration.fromPersistence({
      id: image.id,
      prompt: image.prompt,
      negativePrompt: image.negativePrompt || "",
      aspectRatio: image.aspectRatio as any,
      imageUrl: image.imageUrl,
      fileName: image.fileName,
      fileSize: image.fileSize,
      seed: image.seed,
      createdAt: image.createdAt,
    });
  }

  async findAll(limit: number = 50): Promise<ImageGeneration[]> {
    const images = await db
      .select()
      .from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);

    return images.map(image => ImageGeneration.fromPersistence({
      id: image.id,
      prompt: image.prompt,
      negativePrompt: image.negativePrompt || "",
      aspectRatio: image.aspectRatio as any,
      imageUrl: image.imageUrl,
      fileName: image.fileName,
      fileSize: image.fileSize,
      seed: image.seed,
      createdAt: image.createdAt,
    }));
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(generatedImages)
      .where(eq(generatedImages.id, id));
    
    return (result.rowCount || 0) > 0;
  }
}