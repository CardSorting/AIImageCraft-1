import { pgTable, text, serial, integer, timestamp, bigint, decimal, varchar, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  modelId: text("model_id").notNull(),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt").default(""),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  imageUrl: text("image_url").notNull(),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  seed: bigint("seed", { mode: "number" }),
  // Card Rarity System
  rarityTier: text("rarity_tier").notNull().default("COMMON"),
  rarityScore: integer("rarity_score").notNull().default(50),
  rarityStars: integer("rarity_stars").notNull().default(1),
  rarityLetter: text("rarity_letter").notNull().default("C"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  modelId: text("model_id").notNull().unique(), // e.g., "rundiffusion:130@100"
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  version: text("version").notNull(),
  provider: text("provider").notNull(), // runware, stability, etc.
  featured: integer("featured").default(0), // 0 = false, 1 = true
  rating: integer("rating").default(50), // 1-100 rating
  downloads: integer("downloads").default(0),
  likes: integer("likes").default(0),
  discussions: integer("discussions").default(0),
  imagesGenerated: integer("images_generated").default(0),
  tags: text("tags").array().default([]),
  capabilities: text("capabilities").array().default([]),
  pricing: text("pricing"), // JSON string for pricing tiers
  thumbnail: text("thumbnail"), // Model preview image
  gallery: text("gallery").array().default([]), // Array of example images
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userModelInteractions = pgTable("user_model_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  modelId: integer("model_id").notNull().references(() => aiModels.id),
  interactionType: text("interaction_type").notNull(), // 'view', 'like', 'bookmark', 'generate', 'share', 'download'
  engagementLevel: integer("engagement_level").default(5), // 1-10 scale based on time spent, actions taken
  sessionDuration: integer("session_duration"), // seconds spent viewing/interacting
  deviceType: text("device_type"), // 'mobile', 'tablet', 'desktop'
  referralSource: text("referral_source"), // 'search', 'recommendation', 'direct', 'featured'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBehaviorProfiles = pgTable("user_behavior_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  preferredCategories: text("preferred_categories").array().default([]),
  preferredProviders: text("preferred_providers").array().default([]),
  preferredStyles: text("preferred_styles").array().default([]),
  qualityThreshold: integer("quality_threshold").default(70), // 0-100
  speedPreference: text("speed_preference").default("balanced"), // 'fast', 'balanced', 'quality'
  complexityLevel: text("complexity_level").default("intermediate"), // 'beginner', 'intermediate', 'advanced'
  explorationScore: integer("exploration_score").default(60), // 0-100, willingness to try new things
  averageSessionDuration: integer("average_session_duration").default(600), // seconds
  mostActiveTimeOfDay: integer("most_active_time_of_day").default(14), // 0-23 hours
  totalInteractions: integer("total_interactions").default(0),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userCategoryAffinities = pgTable("user_category_affinities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  affinityScore: integer("affinity_score").notNull(), // 0-100
  interactionCount: integer("interaction_count").default(0),
  lastInteractionAt: timestamp("last_interaction_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProviderAffinities = pgTable("user_provider_affinities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(),
  affinityScore: integer("affinity_score").notNull(), // 0-100
  interactionCount: integer("interaction_count").default(0),
  qualityRating: integer("quality_rating").default(70), // perceived quality 0-100
  lastInteractionAt: timestamp("last_interaction_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userBookmarks = pgTable("user_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  modelId: integer("model_id").notNull().references(() => aiModels.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userLikes = pgTable("user_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  modelId: integer("model_id").notNull().references(() => aiModels.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit System Tables - Clean Architecture Implementation  
export const creditBalances = pgTable("credit_balances", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  amount: text("amount").notNull().default("0"), // Store as text for precision
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  version: integer("version").notNull().default(0),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: text("id").primaryKey(), // nanoid
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // PURCHASE, SPEND, REFUND, BONUS
  amount: text("amount").notNull(), // Store as text for precision
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  balanceAfter: text("balance_after").notNull(), // Store as text for precision
});

export const creditPackages = pgTable("credit_packages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  price: text("price").notNull(), // Store as text for precision
  bonusCredits: integer("bonus_credits").notNull().default(0),
  isActive: integer("is_active").notNull().default(1), // Use integer for boolean
  displayOrder: integer("display_order").notNull().default(0),
  metadata: text("metadata"), // JSON as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  previewImage: text("preview_image"),
  messageCount: integer("message_count").notNull().default(0),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSessions.id),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata"), // For storing additional data like processing status
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertImageSchema = createInsertSchema(generatedImages).omit({
  id: true,
  createdAt: true,
});

export const insertAIModelSchema = createInsertSchema(aiModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const generateImageRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(500, "Prompt must be under 500 characters"),
  negativePrompt: z.string().optional().default(""),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "3:4", "4:3"]).default("1:1"),
  numImages: z.number().int().min(1).max(4).default(1),
  model: z.string().optional().default("runware:100@1"),
  loras: z.array(z.object({
    model: z.string(),
    weight: z.number().min(0).max(2).default(1),
  })).optional().default([]),
  steps: z.number().int().min(1).max(100).optional().default(20),
  cfgScale: z.number().min(0).max(50).optional().default(7),
  seed: z.number().int().optional(),
  scheduler: z.string().optional(),
});

export const insertUserModelInteractionSchema = createInsertSchema(userModelInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertUserBookmarkSchema = createInsertSchema(userBookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertUserLikeSchema = createInsertSchema(userLikes).omit({
  id: true,
  createdAt: true,
});

export const insertUserBehaviorProfileSchema = createInsertSchema(userBehaviorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCategoryAffinitySchema = createInsertSchema(userCategoryAffinities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProviderAffinitySchema = createInsertSchema(userProviderAffinities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  createdAt: true,
  lastActivity: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type AIModel = typeof aiModels.$inferSelect;
export type AIModelWithCounts = AIModel & { likeCount: number; bookmarkCount: number };
export type InsertAIModel = z.infer<typeof insertAIModelSchema>;
export type UserModelInteraction = typeof userModelInteractions.$inferSelect;
export type InsertUserModelInteraction = z.infer<typeof insertUserModelInteractionSchema>;
export type UserBookmark = typeof userBookmarks.$inferSelect;
export type InsertUserBookmark = z.infer<typeof insertUserBookmarkSchema>;
export type UserLike = typeof userLikes.$inferSelect;
export type InsertUserLike = z.infer<typeof insertUserLikeSchema>;
export type UserBehaviorProfile = typeof userBehaviorProfiles.$inferSelect;
export type InsertUserBehaviorProfile = z.infer<typeof insertUserBehaviorProfileSchema>;
export type UserCategoryAffinity = typeof userCategoryAffinities.$inferSelect;
export type InsertUserCategoryAffinity = z.infer<typeof insertUserCategoryAffinitySchema>;
export type UserProviderAffinity = typeof userProviderAffinities.$inferSelect;
export type InsertUserProviderAffinity = z.infer<typeof insertUserProviderAffinitySchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>;
