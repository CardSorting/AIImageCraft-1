import {
  users,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Credit operations
  getCreditBalance(userId: string): Promise<number>;
  updateCredits(userId: string, amount: number, description: string): Promise<void>;
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
}

export const storage = new DatabaseStorage();