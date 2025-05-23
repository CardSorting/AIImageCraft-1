import { pgTable, text, serial, integer, timestamp, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
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
  userId: integer("user_id").notNull(),
  modelId: integer("model_id").notNull().references(() => aiModels.id),
  interactionType: text("interaction_type").notNull(), // 'view', 'like', 'bookmark', 'generate'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBookmarks = pgTable("user_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modelId: integer("model_id").notNull().references(() => aiModels.id),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type AIModel = typeof aiModels.$inferSelect;
export type InsertAIModel = z.infer<typeof insertAIModelSchema>;
export type UserModelInteraction = typeof userModelInteractions.$inferSelect;
export type InsertUserModelInteraction = z.infer<typeof insertUserModelInteractionSchema>;
export type UserBookmark = typeof userBookmarks.$inferSelect;
export type InsertUserBookmark = z.infer<typeof insertUserBookmarkSchema>;
export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>;
