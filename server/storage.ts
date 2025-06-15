import {
  users,
  generatedImages,
  aiModels,
  userModelInteractions,
  userBookmarks,
  userLikes,
  creditBalances,
  creditTransactions,
  chatSessions,
  chatMessages,
  userBehaviorProfiles,
  userCategoryAffinities,
  userProviderAffinities,
  type User,
  type UpsertUser,
  type GeneratedImage,
  type InsertImage,
  type AIModel,
  type AIModelWithCounts,
  type InsertAIModel,
  type UserModelInteraction,
  type InsertUserModelInteraction,
  type UserBookmark,
  type InsertUserBookmark,
  type UserLike,
  type InsertUserLike,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Image operations
  createImage(image: InsertImage): Promise<GeneratedImage>;
  getUserImages(userId: string, limit?: number): Promise<GeneratedImage[]>;
  getImage(id: string): Promise<GeneratedImage | undefined>;
  
  // AI Model operations
  getModels(limit?: number): Promise<AIModelWithCounts[]>;
  getModel(id: number): Promise<AIModel | undefined>;
  createModel(model: InsertAIModel): Promise<AIModel>;
  
  // User interaction operations
  recordInteraction(interaction: InsertUserModelInteraction): Promise<UserModelInteraction>;
  getUserInteractions(userId: string): Promise<UserModelInteraction[]>;
  
  // Bookmark operations
  toggleBookmark(userId: string, modelId: number): Promise<boolean>;
  getUserBookmarks(userId: string): Promise<UserBookmark[]>;
  
  // Like operations
  toggleLike(userId: string, modelId: number): Promise<boolean>;
  getUserLikes(userId: string): Promise<UserLike[]>;
  
  // Credit operations
  getCreditBalance(userId: string): Promise<number>;
  updateCredits(userId: string, amount: number, description: string): Promise<void>;
  
  // Chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
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

  // Image operations
  async createImage(imageData: InsertImage): Promise<GeneratedImage> {
    const [image] = await db
      .insert(generatedImages)
      .values({
        ...imageData,
        id: nanoid(),
      })
      .returning();
    return image;
  }

  async getUserImages(userId: string, limit = 50): Promise<GeneratedImage[]> {
    return await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }

  async getImage(id: string): Promise<GeneratedImage | undefined> {
    const [image] = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, id));
    return image;
  }

  // AI Model operations
  async getModels(limit = 100): Promise<AIModelWithCounts[]> {
    const likeCountQuery = db
      .select({
        modelId: userLikes.modelId,
        count: count().as('likeCount')
      })
      .from(userLikes)
      .groupBy(userLikes.modelId)
      .as('likeCounts');

    const bookmarkCountQuery = db
      .select({
        modelId: userBookmarks.modelId,
        count: count().as('bookmarkCount')
      })
      .from(userBookmarks)
      .groupBy(userBookmarks.modelId)
      .as('bookmarkCounts');

    const results = await db
      .select({
        id: aiModels.id,
        name: aiModels.name,
        checkpoint: aiModels.checkpoint,
        description: aiModels.description,
        category: aiModels.category,
        provider: aiModels.provider,
        modelType: aiModels.modelType,
        baseModel: aiModels.baseModel,
        isNsfw: aiModels.isNsfw,
        tags: aiModels.tags,
        capabilities: aiModels.capabilities,
        pricing: aiModels.pricing,
        imageUrl: aiModels.imageUrl,
        isActive: aiModels.isActive,
        popularity: aiModels.popularity,
        qualityScore: aiModels.qualityScore,
        performanceMetrics: aiModels.performanceMetrics,
        createdAt: aiModels.createdAt,
        updatedAt: aiModels.updatedAt,
        likeCount: sql<number>`COALESCE(${likeCountQuery.count}, 0)`.as('likeCount'),
        bookmarkCount: sql<number>`COALESCE(${bookmarkCountQuery.count}, 0)`.as('bookmarkCount'),
      })
      .from(aiModels)
      .leftJoin(likeCountQuery, eq(aiModels.id, likeCountQuery.modelId))
      .leftJoin(bookmarkCountQuery, eq(aiModels.id, bookmarkCountQuery.modelId))
      .where(eq(aiModels.isActive, true))
      .orderBy(desc(aiModels.popularity))
      .limit(limit);

    return results.map(result => ({
      ...result,
      likeCount: result.likeCount || 0,
      bookmarkCount: result.bookmarkCount || 0,
    }));
  }

  async getModel(id: number): Promise<AIModel | undefined> {
    const [model] = await db
      .select()
      .from(aiModels)
      .where(eq(aiModels.id, id));
    return model;
  }

  async createModel(modelData: InsertAIModel): Promise<AIModel> {
    const [model] = await db
      .insert(aiModels)
      .values(modelData)
      .returning();
    return model;
  }

  // User interaction operations
  async recordInteraction(interactionData: InsertUserModelInteraction): Promise<UserModelInteraction> {
    const [interaction] = await db
      .insert(userModelInteractions)
      .values({
        ...interactionData,
        id: nanoid(),
      })
      .returning();
    return interaction;
  }

  async getUserInteractions(userId: string): Promise<UserModelInteraction[]> {
    return await db
      .select()
      .from(userModelInteractions)
      .where(eq(userModelInteractions.userId, userId))
      .orderBy(desc(userModelInteractions.timestamp));
  }

  // Bookmark operations
  async toggleBookmark(userId: string, modelId: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(userBookmarks)
      .where(and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.modelId, modelId)
      ));

    if (existing.length > 0) {
      await db
        .delete(userBookmarks)
        .where(and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.modelId, modelId)
        ));
      return false;
    } else {
      await db
        .insert(userBookmarks)
        .values({
          id: nanoid(),
          userId,
          modelId,
        });
      return true;
    }
  }

  async getUserBookmarks(userId: string): Promise<UserBookmark[]> {
    return await db
      .select()
      .from(userBookmarks)
      .where(eq(userBookmarks.userId, userId))
      .orderBy(desc(userBookmarks.createdAt));
  }

  // Like operations
  async toggleLike(userId: string, modelId: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(userLikes)
      .where(and(
        eq(userLikes.userId, userId),
        eq(userLikes.modelId, modelId)
      ));

    if (existing.length > 0) {
      await db
        .delete(userLikes)
        .where(and(
          eq(userLikes.userId, userId),
          eq(userLikes.modelId, modelId)
        ));
      return false;
    } else {
      await db
        .insert(userLikes)
        .values({
          id: nanoid(),
          userId,
          modelId,
        });
      return true;
    }
  }

  async getUserLikes(userId: string): Promise<UserLike[]> {
    return await db
      .select()
      .from(userLikes)
      .where(eq(userLikes.userId, userId))
      .orderBy(desc(userLikes.createdAt));
  }

  // Credit operations
  async getCreditBalance(userId: string): Promise<number> {
    const [balance] = await db
      .select()
      .from(creditBalances)
      .where(eq(creditBalances.userId, userId));
    
    if (!balance) {
      // Create initial balance for new user
      await db
        .insert(creditBalances)
        .values({
          userId,
          balance: "100.00", // Starting credits
          lastUpdated: new Date(),
        });
      return 100;
    }
    
    return parseFloat(balance.balance);
  }

  async updateCredits(userId: string, amount: number, description: string): Promise<void> {
    const currentBalance = await this.getCreditBalance(userId);
    const newBalance = currentBalance + amount;
    
    // Update balance
    await db
      .insert(creditBalances)
      .values({
        userId,
        balance: newBalance.toFixed(2),
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: creditBalances.userId,
        set: {
          balance: newBalance.toFixed(2),
          lastUpdated: new Date(),
        },
      });

    // Record transaction
    await db
      .insert(creditTransactions)
      .values({
        id: nanoid(),
        userId,
        type: amount > 0 ? "CREDIT" : "DEBIT",
        amount: Math.abs(amount).toFixed(2),
        description,
        metadata: JSON.stringify({ previousBalance: currentBalance, newBalance }),
      });
  }

  // Chat operations
  async createChatSession(sessionData: InsertChatSession): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({
        ...sessionData,
        id: nanoid(),
      })
      .returning();
    return session;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.lastActivity));
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));
    return session;
  }

  async addChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...messageData,
        id: nanoid(),
      })
      .returning();

    // Update session activity
    await db
      .update(chatSessions)
      .set({
        lastActivity: new Date(),
        messageCount: sql`${chatSessions.messageCount} + 1`,
      })
      .where(eq(chatSessions.id, messageData.sessionId));

    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }
}

export const storage = new DatabaseStorage();