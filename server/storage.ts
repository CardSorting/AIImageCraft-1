import {
  users,
  aiModels,
  generatedImages,
  creditBalances,
  creditTransactions,
  type User,
  type UpsertUser,
  type AIModel,
  type AIModelWithCounts,
  type GeneratedImage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, sql, like } from "drizzle-orm";
import { nanoid } from "nanoid";

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
    // Check if user already exists
    const existingUser = await this.getUser(userData.id);
    const isNewUser = !existingUser;

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

    // If this is a new user, add 100 signup credits
    if (isNewUser) {
      await this.updateCredits(user.id, 100, 'Welcome bonus - 100 free credits');
    }

    return user;
  }

  // Credit operations
  async getCreditBalance(userId: string): Promise<number> {
    const [balance] = await db
      .select({
        amount: creditBalances.amount,
      })
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId));
    
    if (!balance) {
      return 0;
    }
    
    return parseInt(balance.amount);
  }

  async updateCredits(userId: string, amount: number, description: string): Promise<void> {
    const currentBalance = await this.getCreditBalance(userId);
    const newBalance = currentBalance + amount;
    const transactionId = nanoid();

    // Update or create credit balance
    await db
      .insert(creditBalances)
      .values({
        userId,
        amount: newBalance.toString(),
        lastUpdated: new Date(),
        version: 1,
      })
      .onConflictDoUpdate({
        target: creditBalances.userId,
        set: {
          amount: newBalance.toString(),
          lastUpdated: new Date(),
          version: sql`${creditBalances.version} + 1`,
        },
      });

    // Record transaction
    await db.insert(creditTransactions).values({
      id: transactionId,
      userId,
      type: amount > 0 ? 'BONUS' : 'SPEND',
      amount: Math.abs(amount).toString(),
      description,
      balanceAfter: newBalance.toString(),
    });
  }



  // AI Models operations
  async getAIModels(limit: number, sortBy: string, category?: string): Promise<AIModelWithCounts[]> {
    let models: any[];
    
    if (category) {
      switch (sortBy) {
        case 'popular':
          models = await db.select().from(aiModels)
            .where(eq(aiModels.category, category))
            .orderBy(desc(aiModels.likes), desc(aiModels.downloads))
            .limit(limit);
          break;
        case 'trending':
          models = await db.select().from(aiModels)
            .where(eq(aiModels.category, category))
            .orderBy(desc(aiModels.imagesGenerated), desc(aiModels.likes))
            .limit(limit);
          break;
        case 'newest':
        default:
          models = await db.select().from(aiModels)
            .where(eq(aiModels.category, category))
            .orderBy(desc(aiModels.createdAt))
            .limit(limit);
          break;
      }
    } else {
      switch (sortBy) {
        case 'popular':
          models = await db.select().from(aiModels)
            .orderBy(desc(aiModels.likes), desc(aiModels.downloads))
            .limit(limit);
          break;
        case 'trending':
          models = await db.select().from(aiModels)
            .orderBy(desc(aiModels.imagesGenerated), desc(aiModels.likes))
            .limit(limit);
          break;
        case 'newest':
        default:
          models = await db.select().from(aiModels)
            .orderBy(desc(aiModels.createdAt))
            .limit(limit);
          break;
      }
    }
    
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