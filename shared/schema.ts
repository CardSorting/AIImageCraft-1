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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>;
