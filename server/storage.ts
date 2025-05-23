import { users, generatedImages, aiModels, userModelInteractions, userBookmarks, userLikes, type User, type InsertUser, type GeneratedImage, type InsertImage, type AIModel, type InsertAIModel, type UserModelInteraction, type InsertUserModelInteraction, type UserBookmark, type InsertUserBookmark, type UserLike, type InsertUserLike } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image storage methods
  createImage(image: InsertImage): Promise<GeneratedImage>;
  getImages(limit?: number): Promise<GeneratedImage[]>;
  getImageById(id: number): Promise<GeneratedImage | undefined>;
  deleteImage(id: number): Promise<boolean>;
  
  // AI Model storage methods
  createAIModel(model: InsertAIModel): Promise<AIModel>;
  getAIModels(limit?: number, sortBy?: string, category?: string): Promise<AIModel[]>;
  getAIModelById(id: number): Promise<AIModel | undefined>;
  getAIModelByModelId(modelId: string): Promise<AIModel | undefined>;
  updateAIModel(id: number, model: Partial<InsertAIModel>): Promise<AIModel | undefined>;
  deleteAIModel(id: number): Promise<boolean>;
  searchAIModels(query: string, limit?: number): Promise<AIModel[]>;
  getFeaturedAIModels(limit?: number): Promise<AIModel[]>;
  getForYouModels(userId: number, limit?: number): Promise<AIModel[]>;
  getBookmarkedModels(userId: number, limit?: number): Promise<AIModel[]>;
  
  // User interaction methods
  createUserInteraction(interaction: InsertUserModelInteraction): Promise<UserModelInteraction>;
  createUserBookmark(bookmark: InsertUserBookmark): Promise<UserBookmark>;
  removeUserBookmark(userId: number, modelId: number): Promise<boolean>;
  isModelBookmarked(userId: number, modelId: number): Promise<boolean>;
  
  // User like methods
  createUserLike(like: InsertUserLike): Promise<UserLike>;
  removeUserLike(userId: number, modelId: number): Promise<boolean>;
  isModelLiked(userId: number, modelId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createImage(insertImage: InsertImage): Promise<GeneratedImage> {
    const [image] = await db
      .insert(generatedImages)
      .values({
        ...insertImage,
        negativePrompt: insertImage.negativePrompt || "",
        aspectRatio: insertImage.aspectRatio || "1:1",
        fileName: insertImage.fileName || null,
        fileSize: insertImage.fileSize || null,
        seed: insertImage.seed || null,
      })
      .returning();
    return image;
  }

  async getImages(limit: number = 50): Promise<GeneratedImage[]> {
    const images = await db
      .select()
      .from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
    return images;
  }

  async getImageById(id: number): Promise<GeneratedImage | undefined> {
    const [image] = await db.select().from(generatedImages).where(eq(generatedImages.id, id));
    return image || undefined;
  }

  async deleteImage(id: number): Promise<boolean> {
    const result = await db.delete(generatedImages).where(eq(generatedImages.id, id));
    return result.rowCount > 0;
  }

  // AI Model methods implementation
  async createAIModel(insertModel: InsertAIModel): Promise<AIModel> {
    const [model] = await db.insert(aiModels).values(insertModel).returning();
    return model;
  }

  async getAIModels(limit: number = 50, sortBy: string = 'newest', category?: string): Promise<AIModel[]> {
    let query = db.select().from(aiModels);
    
    if (category) {
      query = query.where(eq(aiModels.category, category));
    }
    
    // Advanced sorting based on user preference
    switch (sortBy) {
      case 'highest_rated':
        query = query.orderBy(desc(aiModels.rating));
        break;
      case 'most_liked':
        query = query.orderBy(desc(aiModels.likes));
        break;
      case 'most_discussed':
        query = query.orderBy(desc(aiModels.discussions));
        break;
      case 'most_images':
        query = query.orderBy(desc(aiModels.imagesGenerated));
        break;
      case 'newest':
        query = query.orderBy(desc(aiModels.createdAt));
        break;
      case 'oldest':
        query = query.orderBy(aiModels.createdAt);
        break;
      default:
        query = query.orderBy(desc(aiModels.createdAt));
    }
    
    return query.limit(limit);
  }

  async getAIModelById(id: number): Promise<AIModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return model || undefined;
  }

  async getAIModelByModelId(modelId: string): Promise<AIModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.modelId, modelId));
    return model || undefined;
  }

  async updateAIModel(id: number, updateData: Partial<InsertAIModel>): Promise<AIModel | undefined> {
    try {
      const [model] = await db.update(aiModels)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(aiModels.id, id))
        .returning();
      return model || undefined;
    } catch (error) {
      console.error("Error updating AI model:", error);
      return undefined;
    }
  }

  async deleteAIModel(id: number): Promise<boolean> {
    try {
      const result = await db.delete(aiModels).where(eq(aiModels.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting AI model:", error);
      return false;
    }
  }

  async searchAIModels(query: string, limit: number = 20): Promise<AIModel[]> {
    return db.select().from(aiModels)
      .where(like(aiModels.name, `%${query}%`))
      .orderBy(desc(aiModels.rating))
      .limit(limit);
  }

  async getFeaturedAIModels(limit: number = 10): Promise<AIModel[]> {
    return db.select().from(aiModels)
      .where(eq(aiModels.featured, 1))
      .orderBy(desc(aiModels.rating))
      .limit(limit);
  }

  // Advanced "For You" algorithm based on user interactions
  async getForYouModels(userId: number, limit: number = 20): Promise<AIModel[]> {
    // Get user's interaction history to understand preferences
    const userInteractions = await db.select()
      .from(userModelInteractions)
      .where(eq(userModelInteractions.userId, userId))
      .orderBy(desc(userModelInteractions.createdAt))
      .limit(100);

    if (userInteractions.length === 0) {
      // New user - show featured and highly rated models
      return db.select().from(aiModels)
        .where(eq(aiModels.featured, 1))
        .orderBy(desc(aiModels.rating))
        .limit(limit);
    }

    // Extract categories and providers from user's history
    const interactedModelIds = userInteractions.map(i => i.modelId);
    const interactedModels = await db.select()
      .from(aiModels)
      .where(sql`${aiModels.id} = ANY(${interactedModelIds})`);

    const preferredCategories = [...new Set(interactedModels.map(m => m.category))];
    const preferredProviders = [...new Set(interactedModels.map(m => m.provider))];

    // Recommend similar models the user hasn't interacted with
    return db.select().from(aiModels)
      .where(
        and(
          sql`${aiModels.category} = ANY(${preferredCategories}) OR ${aiModels.provider} = ANY(${preferredProviders})`,
          sql`${aiModels.id} NOT IN (${interactedModelIds.join(',')})`
        )
      )
      .orderBy(desc(aiModels.rating), desc(aiModels.likes))
      .limit(limit);
  }

  async getBookmarkedModels(userId: number, limit: number = 50): Promise<AIModel[]> {
    return db.select({
      id: aiModels.id,
      modelId: aiModels.modelId,
      name: aiModels.name,
      description: aiModels.description,
      category: aiModels.category,
      version: aiModels.version,
      provider: aiModels.provider,
      featured: aiModels.featured,
      rating: aiModels.rating,
      downloads: aiModels.downloads,
      likes: aiModels.likes,
      discussions: aiModels.discussions,
      imagesGenerated: aiModels.imagesGenerated,
      tags: aiModels.tags,
      capabilities: aiModels.capabilities,
      pricing: aiModels.pricing,
      thumbnail: aiModels.thumbnail,
      gallery: aiModels.gallery,
      createdAt: aiModels.createdAt,
      updatedAt: aiModels.updatedAt,
    })
    .from(aiModels)
    .innerJoin(userBookmarks, eq(userBookmarks.modelId, aiModels.id))
    .where(eq(userBookmarks.userId, userId))
    .orderBy(desc(userBookmarks.createdAt))
    .limit(limit);
  }

  // User interaction methods
  async createUserInteraction(interaction: InsertUserModelInteraction): Promise<UserModelInteraction> {
    const [newInteraction] = await db.insert(userModelInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async createUserBookmark(bookmark: InsertUserBookmark): Promise<UserBookmark> {
    const [newBookmark] = await db.insert(userBookmarks)
      .values(bookmark)
      .returning();
    return newBookmark;
  }

  async removeUserBookmark(userId: number, modelId: number): Promise<boolean> {
    try {
      const result = await db.delete(userBookmarks)
        .where(and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.modelId, modelId)
        ));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      return false;
    }
  }

  async isModelBookmarked(userId: number, modelId: number): Promise<boolean> {
    const [bookmark] = await db.select()
      .from(userBookmarks)
      .where(and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.modelId, modelId)
      ))
      .limit(1);
    return !!bookmark;
  }
}

export const storage = new DatabaseStorage();
