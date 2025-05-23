import { users, generatedImages, type User, type InsertUser, type GeneratedImage, type InsertImage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image storage methods
  createImage(image: InsertImage): Promise<GeneratedImage>;
  getImages(limit?: number): Promise<GeneratedImage[]>;
  getImageById(id: number): Promise<GeneratedImage | undefined>;
  deleteImage(id: number): Promise<boolean>;
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
}

export const storage = new DatabaseStorage();
