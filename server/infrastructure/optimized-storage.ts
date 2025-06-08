import { users, generatedImages, aiModels, userModelInteractions, userBookmarks, userLikes, chatSessions, chatMessages, type User, type InsertUser, type GeneratedImage, type InsertImage, type AIModel, type InsertAIModel, type UserModelInteraction, type InsertUserModelInteraction, type UserBookmark, type InsertUserBookmark, type UserLike, type InsertUserLike, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage, type AIModelWithCounts } from "@shared/schema";
import { db, createMemoizedQuery } from "./database";
import { eq, desc, asc, like, and, or, sql, count, inArray, gt, lt, gte, lte } from "drizzle-orm";
import memoizee from 'memoizee';

export interface IOptimizedStorage {
  // Cached user operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAuth0Id(auth0Id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Batch image operations
  createImages(images: InsertImage[]): Promise<GeneratedImage[]>;
  getImages(limit?: number, offset?: number): Promise<GeneratedImage[]>;
  getImagesByUserId(userId: number, limit?: number, offset?: number): Promise<GeneratedImage[]>;
  getImageById(id: number): Promise<GeneratedImage | undefined>;
  getImagesByModelIds(modelIds: string[], limit?: number): Promise<(GeneratedImage & { username: string })[]>;
  deleteImages(ids: number[]): Promise<number>;
  
  // Optimized AI Model operations with caching
  createAIModel(model: InsertAIModel): Promise<AIModel>;
  getAIModels(limit?: number, sortBy?: string, category?: string, offset?: number): Promise<AIModelWithCounts[]>;
  getAIModelById(id: number): Promise<AIModel | undefined>;
  getAIModelByModelId(modelId: string): Promise<AIModel | undefined>;
  updateAIModel(id: number, model: Partial<InsertAIModel>): Promise<AIModel | undefined>;
  deleteAIModel(id: number): Promise<boolean>;
  searchAIModels(query: string, limit?: number): Promise<AIModel[]>;
  getFeaturedAIModels(limit?: number): Promise<AIModel[]>;
  getForYouModels(userId: number, limit?: number): Promise<AIModel[]>;
  getBookmarkedModels(userId: number, limit?: number): Promise<AIModel[]>;
  
  // Batch interaction operations
  createUserInteractions(interactions: InsertUserModelInteraction[]): Promise<UserModelInteraction[]>;
  createUserBookmarks(bookmarks: InsertUserBookmark[]): Promise<UserBookmark[]>;
  removeUserBookmarks(userId: number, modelIds: number[]): Promise<number>;
  isModelBookmarked(userId: number, modelId: number): Promise<boolean>;
  getUserBookmarkStatus(userId: number, modelIds: number[]): Promise<Map<number, boolean>>;
  
  // Batch like operations
  createUserLikes(likes: InsertUserLike[]): Promise<UserLike[]>;
  removeUserLikes(userId: number, modelIds: number[]): Promise<number>;
  isModelLiked(userId: number, modelId: number): Promise<boolean>;
  getUserLikeStatus(userId: number, modelIds: number[]): Promise<Map<number, boolean>>;
  
  // Optimized chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessions(userId: number, limit?: number): Promise<ChatSession[]>;
  getChatSessionById(sessionId: string): Promise<ChatSession | undefined>;
  updateChatSession(sessionId: string, updates: Partial<InsertChatSession>): Promise<ChatSession | undefined>;
  deleteChatSession(sessionId: string): Promise<boolean>;
  
  createChatMessages(messages: InsertChatMessage[]): Promise<ChatMessage[]>;
  getChatMessages(sessionId: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
  updateChatMessage(messageId: number, updates: Partial<InsertChatMessage>): Promise<ChatMessage | undefined>;
  
  // Analytics and statistics
  getModelStatistics(modelIds?: number[]): Promise<Array<{modelId: number, likes: number, bookmarks: number, images: number}>>;
  getUserEngagementMetrics(userId: number): Promise<{totalInteractions: number, averageEngagement: number, preferredCategories: string[]}>;
  
  // Cache management
  invalidateCache(patterns?: string[]): void;
}

export class OptimizedDatabaseStorage implements IOptimizedStorage {
  
  // Memoized user queries with 10 minute cache
  private getCachedUser = createMemoizedQuery(
    async (id: number) => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    },
    { maxAge: 600000, max: 1000 }
  );

  private getCachedUserByUsername = createMemoizedQuery(
    async (username: string) => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    },
    { maxAge: 600000, max: 1000 }
  );

  // Memoized AI model queries with 5 minute cache
  private getCachedAIModels = createMemoizedQuery(
    async (limit: number, sortBy: string, category?: string, offset: number = 0) => {
      let baseQuery = db
        .select({
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
          likeCount: sql<number>`COALESCE((SELECT COUNT(*) FROM ${userLikes} WHERE ${userLikes.modelId} = ${aiModels.id}), 0)`,
          bookmarkCount: sql<number>`COALESCE((SELECT COUNT(*) FROM ${userBookmarks} WHERE ${userBookmarks.modelId} = ${aiModels.id}), 0)`,
        })
        .from(aiModels);
      
      if (category) {
        baseQuery = baseQuery.where(eq(aiModels.category, category));
      }
      
      // Optimized sorting with pre-calculated aggregates
      switch (sortBy) {
        case 'highest_rated':
          baseQuery = baseQuery.orderBy(desc(aiModels.rating), desc(aiModels.likes));
          break;
        case 'most_liked':
          baseQuery = baseQuery.orderBy(desc(aiModels.likes), desc(aiModels.rating));
          break;
        case 'most_discussed':
          baseQuery = baseQuery.orderBy(desc(aiModels.discussions), desc(aiModels.rating));
          break;
        case 'most_images':
          baseQuery = baseQuery.orderBy(desc(aiModels.imagesGenerated), desc(aiModels.rating));
          break;
        case 'newest':
          baseQuery = baseQuery.orderBy(desc(aiModels.createdAt));
          break;
        case 'oldest':
          baseQuery = baseQuery.orderBy(asc(aiModels.createdAt));
          break;
        default:
          baseQuery = baseQuery.orderBy(desc(aiModels.createdAt));
      }
      
      return baseQuery.offset(offset).limit(limit);
    },
    { maxAge: 300000, max: 100 }
  );

  private getCachedFeaturedModels = createMemoizedQuery(
    async (limit: number) => {
      return db.select().from(aiModels)
        .where(eq(aiModels.featured, 1))
        .orderBy(desc(aiModels.rating), desc(aiModels.likes))
        .limit(limit);
    },
    { maxAge: 600000, max: 10 }
  );

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.getCachedUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.getCachedUserByUsername(username);
  }

  async getUserByAuth0Id(auth0Id: string): Promise<User | undefined> {
    return this.getCachedUserByUsername(auth0Id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    // Invalidate user cache
    this.invalidateCache(['getCachedUser', 'getCachedUserByUsername']);
    return user;
  }

  // Batch image operations
  async createImages(insertImages: InsertImage[]): Promise<GeneratedImage[]> {
    if (insertImages.length === 0) return [];
    
    const images = await db.insert(generatedImages)
      .values(insertImages.map(img => ({
        ...img,
        negativePrompt: img.negativePrompt || "",
        aspectRatio: img.aspectRatio || "1:1",
        fileName: img.fileName || null,
        fileSize: img.fileSize || null,
        seed: img.seed || null,
      })))
      .returning();
    
    return images;
  }

  async getImages(limit: number = 50, offset: number = 0): Promise<GeneratedImage[]> {
    return db.select()
      .from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async getImagesByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<GeneratedImage[]> {
    return db.select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async getImageById(id: number): Promise<GeneratedImage | undefined> {
    const [image] = await db.select().from(generatedImages).where(eq(generatedImages.id, id));
    return image || undefined;
  }

  async getImagesByModelIds(modelIds: string[], limit: number = 100): Promise<(GeneratedImage & { username: string })[]> {
    if (modelIds.length === 0) return [];
    
    return db.select({
      id: generatedImages.id,
      userId: generatedImages.userId,
      modelId: generatedImages.modelId,
      prompt: generatedImages.prompt,
      negativePrompt: generatedImages.negativePrompt,
      aspectRatio: generatedImages.aspectRatio,
      imageUrl: generatedImages.imageUrl,
      fileName: generatedImages.fileName,
      fileSize: generatedImages.fileSize,
      seed: generatedImages.seed,
      rarityTier: generatedImages.rarityTier,
      rarityScore: generatedImages.rarityScore,
      rarityStars: generatedImages.rarityStars,
      rarityLetter: generatedImages.rarityLetter,
      createdAt: generatedImages.createdAt,
      username: users.username,
    })
    .from(generatedImages)
    .innerJoin(users, eq(generatedImages.userId, users.id))
    .where(inArray(generatedImages.modelId, modelIds))
    .orderBy(desc(generatedImages.createdAt))
    .limit(limit);
  }

  async deleteImages(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(generatedImages).where(inArray(generatedImages.id, ids));
    return result.rowCount || 0;
  }

  // AI Model operations with aggressive caching
  async createAIModel(insertModel: InsertAIModel): Promise<AIModel> {
    const [model] = await db.insert(aiModels).values(insertModel).returning();
    this.invalidateCache(['getCachedAIModels', 'getCachedFeaturedModels']);
    return model;
  }

  async getAIModels(limit: number = 50, sortBy: string = 'newest', category?: string, offset: number = 0): Promise<AIModelWithCounts[]> {
    return this.getCachedAIModels(limit, sortBy, category, offset) as Promise<AIModelWithCounts[]>;
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
      
      this.invalidateCache(['getCachedAIModels', 'getCachedFeaturedModels']);
      return model || undefined;
    } catch (error) {
      console.error("Error updating AI model:", error);
      return undefined;
    }
  }

  async deleteAIModel(id: number): Promise<boolean> {
    try {
      const result = await db.delete(aiModels).where(eq(aiModels.id, id));
      this.invalidateCache(['getCachedAIModels', 'getCachedFeaturedModels']);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting AI model:", error);
      return false;
    }
  }

  async searchAIModels(query: string, limit: number = 20): Promise<AIModel[]> {
    // Use full-text search for better performance
    return db.select().from(aiModels)
      .where(
        or(
          sql`to_tsvector('english', ${aiModels.name}) @@ plainto_tsquery('english', ${query})`,
          sql`to_tsvector('english', ${aiModels.description}) @@ plainto_tsquery('english', ${query})`,
          sql`${query} = ANY(${aiModels.tags})`
        )
      )
      .orderBy(desc(aiModels.rating), desc(aiModels.likes))
      .limit(limit);
  }

  async getFeaturedAIModels(limit: number = 10): Promise<AIModel[]> {
    return this.getCachedFeaturedModels(limit);
  }

  async getForYouModels(userId: number, limit: number = 20): Promise<AIModel[]> {
    // Optimized personalized recommendations
    const userInteractions = await db.select({
      modelId: userModelInteractions.modelId,
      category: aiModels.category,
      provider: aiModels.provider,
      interactionType: userModelInteractions.interactionType,
    })
    .from(userModelInteractions)
    .innerJoin(aiModels, eq(userModelInteractions.modelId, aiModels.id))
    .where(eq(userModelInteractions.userId, userId))
    .orderBy(desc(userModelInteractions.createdAt))
    .limit(100);

    if (userInteractions.length === 0) {
      return this.getFeaturedAIModels(limit);
    }

    const preferredCategories = [...new Set(userInteractions.map(i => i.category))];
    const preferredProviders = [...new Set(userInteractions.map(i => i.provider))];
    const interactedModelIds = userInteractions.map(i => i.modelId);

    return db.select().from(aiModels)
      .where(
        and(
          or(
            inArray(aiModels.category, preferredCategories),
            inArray(aiModels.provider, preferredProviders)
          ),
          sql`${aiModels.id} NOT IN (${interactedModelIds.join(',') || '0'})`
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
    .innerJoin(userBookmarks, eq(aiModels.id, userBookmarks.modelId))
    .where(eq(userBookmarks.userId, userId))
    .orderBy(desc(userBookmarks.createdAt))
    .limit(limit);
  }

  // Batch interaction operations
  async createUserInteractions(interactions: InsertUserModelInteraction[]): Promise<UserModelInteraction[]> {
    if (interactions.length === 0) return [];
    return db.insert(userModelInteractions).values(interactions).returning();
  }

  async createUserBookmarks(bookmarks: InsertUserBookmark[]): Promise<UserBookmark[]> {
    if (bookmarks.length === 0) return [];
    return db.insert(userBookmarks).values(bookmarks).returning();
  }

  async removeUserBookmarks(userId: number, modelIds: number[]): Promise<number> {
    if (modelIds.length === 0) return 0;
    const result = await db.delete(userBookmarks)
      .where(and(
        eq(userBookmarks.userId, userId),
        inArray(userBookmarks.modelId, modelIds)
      ));
    return result.rowCount || 0;
  }

  async isModelBookmarked(userId: number, modelId: number): Promise<boolean> {
    const [bookmark] = await db.select({ id: userBookmarks.id })
      .from(userBookmarks)
      .where(and(eq(userBookmarks.userId, userId), eq(userBookmarks.modelId, modelId)))
      .limit(1);
    return !!bookmark;
  }

  async getUserBookmarkStatus(userId: number, modelIds: number[]): Promise<Map<number, boolean>> {
    if (modelIds.length === 0) return new Map();
    
    const bookmarks = await db.select({ modelId: userBookmarks.modelId })
      .from(userBookmarks)
      .where(and(
        eq(userBookmarks.userId, userId),
        inArray(userBookmarks.modelId, modelIds)
      ));
    
    const bookmarkedIds = new Set(bookmarks.map(b => b.modelId));
    const statusMap = new Map<number, boolean>();
    modelIds.forEach(id => statusMap.set(id, bookmarkedIds.has(id)));
    return statusMap;
  }

  // Batch like operations
  async createUserLikes(likes: InsertUserLike[]): Promise<UserLike[]> {
    if (likes.length === 0) return [];
    return db.insert(userLikes).values(likes).returning();
  }

  async removeUserLikes(userId: number, modelIds: number[]): Promise<number> {
    if (modelIds.length === 0) return 0;
    const result = await db.delete(userLikes)
      .where(and(
        eq(userLikes.userId, userId),
        inArray(userLikes.modelId, modelIds)
      ));
    return result.rowCount || 0;
  }

  async isModelLiked(userId: number, modelId: number): Promise<boolean> {
    const [like] = await db.select({ id: userLikes.id })
      .from(userLikes)
      .where(and(eq(userLikes.userId, userId), eq(userLikes.modelId, modelId)))
      .limit(1);
    return !!like;
  }

  async getUserLikeStatus(userId: number, modelIds: number[]): Promise<Map<number, boolean>> {
    if (modelIds.length === 0) return new Map();
    
    const likes = await db.select({ modelId: userLikes.modelId })
      .from(userLikes)
      .where(and(
        eq(userLikes.userId, userId),
        inArray(userLikes.modelId, modelIds)
      ));
    
    const likedIds = new Set(likes.map(l => l.modelId));
    const statusMap = new Map<number, boolean>();
    modelIds.forEach(id => statusMap.set(id, likedIds.has(id)));
    return statusMap;
  }

  // Chat operations
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const [session] = await db.insert(chatSessions).values(insertSession).returning();
    return session;
  }

  async getChatSessions(userId: number, limit: number = 50): Promise<ChatSession[]> {
    return db.select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.lastActivity))
      .limit(limit);
  }

  async getChatSessionById(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, sessionId));
    return session || undefined;
  }

  async updateChatSession(sessionId: string, updates: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const [session] = await db.update(chatSessions)
      .set({ ...updates, lastActivity: new Date() })
      .where(eq(chatSessions.id, sessionId))
      .returning();
    return session || undefined;
  }

  async deleteChatSession(sessionId: string): Promise<boolean> {
    const result = await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
    return (result.rowCount || 0) > 0;
  }

  async createChatMessages(messages: InsertChatMessage[]): Promise<ChatMessage[]> {
    if (messages.length === 0) return [];
    return db.insert(chatMessages).values(messages).returning();
  }

  async getChatMessages(sessionId: string, limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    return db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async updateChatMessage(messageId: number, updates: Partial<InsertChatMessage>): Promise<ChatMessage | undefined> {
    const [message] = await db.update(chatMessages)
      .set(updates)
      .where(eq(chatMessages.id, messageId))
      .returning();
    return message || undefined;
  }

  // Analytics and statistics
  async getModelStatistics(modelIds?: number[]): Promise<Array<{modelId: number, likes: number, bookmarks: number, images: number}>> {
    let baseQuery = db.select({
      modelId: aiModels.id,
      likes: sql<number>`COALESCE((SELECT COUNT(*) FROM ${userLikes} WHERE ${userLikes.modelId} = ${aiModels.id}), 0)`,
      bookmarks: sql<number>`COALESCE((SELECT COUNT(*) FROM ${userBookmarks} WHERE ${userBookmarks.modelId} = ${aiModels.id}), 0)`,
      images: sql<number>`COALESCE((SELECT COUNT(*) FROM ${generatedImages} WHERE ${generatedImages.modelId} = ${aiModels.modelId}), 0)`,
    }).from(aiModels);

    if (modelIds && modelIds.length > 0) {
      baseQuery = baseQuery.where(inArray(aiModels.id, modelIds));
    }

    return baseQuery;
  }

  async getUserEngagementMetrics(userId: number): Promise<{totalInteractions: number, averageEngagement: number, preferredCategories: string[]}> {
    const interactions = await db.select({
      count: count(),
      avgEngagement: sql<number>`AVG(${userModelInteractions.engagementLevel})`,
    })
    .from(userModelInteractions)
    .where(eq(userModelInteractions.userId, userId));

    const categories = await db.select({
      category: aiModels.category,
      count: count(),
    })
    .from(userModelInteractions)
    .innerJoin(aiModels, eq(userModelInteractions.modelId, aiModels.id))
    .where(eq(userModelInteractions.userId, userId))
    .groupBy(aiModels.category)
    .orderBy(desc(count()))
    .limit(5);

    return {
      totalInteractions: interactions[0]?.count || 0,
      averageEngagement: Math.round(interactions[0]?.avgEngagement || 0),
      preferredCategories: categories.map(c => c.category),
    };
  }

  // Cache management
  invalidateCache(patterns?: string[]): void {
    if (!patterns) {
      // Clear all memoized caches
      memoizee.clear(this.getCachedUser);
      memoizee.clear(this.getCachedUserByUsername);
      memoizee.clear(this.getCachedAIModels);
      memoizee.clear(this.getCachedFeaturedModels);
    } else {
      patterns.forEach(pattern => {
        if (pattern.includes('User')) {
          memoizee.clear(this.getCachedUser);
          memoizee.clear(this.getCachedUserByUsername);
        }
        if (pattern.includes('AI') || pattern.includes('Model')) {
          memoizee.clear(this.getCachedAIModels);
          memoizee.clear(this.getCachedFeaturedModels);
        }
      });
    }
  }
}

export const optimizedStorage = new OptimizedDatabaseStorage();