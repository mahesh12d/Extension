import { users, profiles, type User, type InsertUser, type Profile, type InsertProfile } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profile
  getProfiles(userId: number): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile & { userId: number }): Promise<Profile>;
  updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile>;
  deleteProfile(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProfiles(userId: number): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.userId, userId));
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(profile: InsertProfile & { userId: number }): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile> {
    const [updatedProfile] = await db.update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }
}

export const storage = new DatabaseStorage();
