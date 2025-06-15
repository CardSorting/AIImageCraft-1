import {
  users,
  aiModels,
  generatedImages,
  type User,
  type UpsertUser,
  type AIModel,
  type AIModelWithCounts,
  type GeneratedImage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, sql, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Credit operations
  getCreditBalance(userId: string): Promise<number>;
  updateCredits(userId: string, amount: number, description: string): Promise<void>;
  
  // AI Models operations
  getAIModels(limit: number, sortBy: string, category?: string): Promise<AIModelWithCounts[]>;
  getFeaturedAIModels(limit: number): Promise<AIModel[]>;
  searchAIModels(query: string, limit: number): Promise<AIModel[]>;
  getForYouModels(userId: string, limit: number): Promise<AIModel[]>;
  
  // Images operations
  getImages(limit: number): Promise<GeneratedImage[]>;
  getUserImages(userId: string, limit: number): Promise<GeneratedImage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Simple credit operations
  async getCreditBalance(userId: string): Promise<number> {
    // Return default credits for now
    return 100;
  }

  async updateCredits(userId: string, amount: number, description: string): Promise<void> {
    // Placeholder - credits will be tracked in future iteration
    console.log(`Credits updated for ${userId}: ${amount} (${description})`);
  }

  // AI Models operations
  async getAIModels(limit: number, sortBy: string, category?: string): Promise<AIModelWithCounts[]> {
    let baseQuery = db.select().from(aiModels);
    
    if (category) {
      baseQuery = baseQuery.where(eq(aiModels.category, category));
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        baseQuery = baseQuery.orderBy(desc(aiModels.likes), desc(aiModels.downloads));
        break;
      case 'trending':
        baseQuery = baseQuery.orderBy(desc(aiModels.imagesGenerated), desc(aiModels.likes));
        break;
      case 'newest':
      default:
        baseQuery = baseQuery.orderBy(desc(aiModels.createdAt));
        break;
    }
    
    const models = await baseQuery.limit(limit);
    
    // Add like and bookmark counts (simplified for now)
    return models.map(model => ({
      ...model,
      likeCount: 0,
      bookmarkCount: 0
    }));
  }

  async getFeaturedAIModels(limit: number): Promise<AIModel[]> {
    return db.select().from(aiModels)
      .where(eq(aiModels.featured, 1))
      .orderBy(desc(aiModels.rating), desc(aiModels.likes))
      .limit(limit);
  }

  async searchAIModels(query: string, limit: number): Promise<AIModel[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.select().from(aiModels)
      .where(
        or(
          like(aiModels.name, searchTerm),
          like(aiModels.description, searchTerm),
          like(aiModels.category, searchTerm),
          like(aiModels.provider, searchTerm)
        )
      )
      .orderBy(desc(aiModels.rating), desc(aiModels.likes))
      .limit(limit);
  }

  async getForYouModels(userId: string, limit: number): Promise<AIModel[]> {
    // For now, return featured models - personalization can be added later
    return this.getFeaturedAIModels(limit);
  }

  // Images operations
  async getImages(limit: number): Promise<GeneratedImage[]> {
    return db.select().from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }

  async getUserImages(userId: string, limit: number): Promise<GeneratedImage[]> {
    return db.select().from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();