import { db } from "@db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { eq, and } from "drizzle-orm";
import {
  users,
  assessments,
  guidance,
  resources,
  progress,
  User
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser: (id: number) => Promise<User | null>;
  getUserByUsername: (username: string) => Promise<User | null>;
  createUser: (userData: { username: string; password: string }) => Promise<User>;
  
  // Assessment methods
  getAssessmentByUserId: (userId: number) => Promise<any | null>;
  createOrUpdateAssessment: (assessmentData: any) => Promise<any>;
  
  // Guidance methods
  getGuidanceByUserId: (userId: number) => Promise<any | null>;
  createOrUpdateGuidance: (guidanceData: any) => Promise<any>;
  
  // Resources methods
  getResourcesByUserId: (userId: number) => Promise<any[]>;
  createResource: (resourceData: any) => Promise<any>;
  
  // Progress methods
  getProgressByUserId: (userId: number) => Promise<any[]>;
  createOrUpdateProgress: (progressData: any) => Promise<any>;
  
  // Session store
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: { username: string; password: string }): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  // Assessment methods
  async getAssessmentByUserId(userId: number): Promise<any | null> {
    const result = await db.select().from(assessments).where(eq(assessments.userId, userId)).limit(1);
    return result[0] || null;
  }

  async createOrUpdateAssessment(assessmentData: any): Promise<any> {
    const { userId } = assessmentData;
    const existing = await this.getAssessmentByUserId(userId);

    if (existing) {
      const result = await db
        .update(assessments)
        .set(assessmentData)
        .where(eq(assessments.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(assessments).values(assessmentData).returning();
      return result[0];
    }
  }

  // Guidance methods
  async getGuidanceByUserId(userId: number): Promise<any | null> {
    const result = await db.select().from(guidance).where(eq(guidance.userId, userId)).limit(1);
    return result[0] || null;
  }

  async createOrUpdateGuidance(guidanceData: any): Promise<any> {
    const { userId } = guidanceData;
    const existing = await this.getGuidanceByUserId(userId);

    if (existing) {
      const result = await db
        .update(guidance)
        .set(guidanceData)
        .where(eq(guidance.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(guidance).values(guidanceData).returning();
      return result[0];
    }
  }

  // Resources methods
  async getResourcesByUserId(userId: number): Promise<any[]> {
    return db.select().from(resources).where(eq(resources.userId, userId));
  }

  async createResource(resourceData: any): Promise<any> {
    const result = await db.insert(resources).values(resourceData).returning();
    return result[0];
  }

  // Progress methods
  async getProgressByUserId(userId: number): Promise<any[]> {
    return db.select().from(progress).where(eq(progress.userId, userId));
  }

  async createOrUpdateProgress(progressData: any): Promise<any> {
    const { userId, name } = progressData;
    const existing = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.name, name)))
      .limit(1);

    if (existing.length > 0) {
      const result = await db
        .update(progress)
        .set(progressData)
        .where(eq(progress.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(progress).values(progressData).returning();
      return result[0];
    }
  }
}

export const storage = new DatabaseStorage();
