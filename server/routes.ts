import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateGuidance } from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Assessment routes
  const assessmentSchema = z.object({
    userId: z.number(),
    experienceLevel: z.string(),
    languages: z.array(z.string()),
    learningGoal: z.string(),
    goalDetails: z.string().optional(),
    learningStyle: z.string(),
    timeCommitment: z.string(),
  });

  // Get user's assessment
  app.get("/api/assessment", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const assessment = await storage.getAssessmentByUserId(req.user.id);
      if (!assessment) {
        return res.json(null);
      }
      return res.json(assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      return res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  // Submit assessment
  app.post("/api/assessment", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Validate the assessment data
      const validatedData = assessmentSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Store the assessment - this should succeed even if guidance generation fails
      const assessment = await storage.createOrUpdateAssessment(validatedData);
      
      try {
        // Generate initial guidance - this may fail if OpenAI API has issues
        await generateGuidance(req.user.id, assessment);
      } catch (guidanceError) {
        // Log the guidance error but don't fail the assessment submission
        console.error("Error generating guidance, but assessment was saved:", guidanceError);
      }
      
      return res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating assessment:", error);
      return res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  // Get user's AI guidance
  app.get("/api/guidance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const guidance = await storage.getGuidanceByUserId(req.user.id);
      if (!guidance) {
        return res.status(404).json({ error: "Guidance not found" });
      }
      return res.json(guidance);
    } catch (error) {
      console.error("Error fetching guidance:", error);
      return res.status(500).json({ error: "Failed to fetch guidance" });
    }
  });

  // Refresh guidance
  app.post("/api/guidance/refresh", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const assessment = await storage.getAssessmentByUserId(req.user.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      // Generate new guidance based on existing assessment
      const guidance = await generateGuidance(req.user.id, assessment);
      
      return res.json(guidance);
    } catch (error) {
      console.error("Error refreshing guidance:", error);
      return res.status(500).json({ error: "Failed to refresh guidance" });
    }
  });

  // Get resources for user
  app.get("/api/resources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const resources = await storage.getResourcesByUserId(req.user.id);
      return res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      return res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  // Get progress for user
  app.get("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const progress = await storage.getProgressByUserId(req.user.id);
      return res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      return res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
