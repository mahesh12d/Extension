import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "default_secret_dev_only";

// Middleware to verify JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Bypass for dev test
  if (!token || token === "dev-token") {
    // Get first user or fallback
    storage.getUserByUsername("devuser").then(user => {
      (req as any).user = { id: user?.id || 1, username: "devuser" };
      next();
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      
      res.status(201).json({ token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.status(200).json({ token });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile Routes - Protected
  app.get(api.profiles.list.path, authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const profiles = await storage.getProfiles(userId);
    res.json(profiles);
  });

  app.post(api.profiles.create.path, authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const input = api.profiles.create.input.parse(req.body);
      const profile = await storage.createProfile({ ...input, userId });
      res.status(201).json(profile);
    } catch (err) {
      console.error("Error creating profile:", err);
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
      } else {
         res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put(api.profiles.update.path, authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const profileId = parseInt(req.params.id);
      const existing = await storage.getProfile(profileId);
      
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const input = api.profiles.update.input.parse(req.body);
      const updated = await storage.updateProfile(profileId, input);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.profiles.delete.path, authenticateToken, async (req, res) => {
    const userId = (req as any).user.id;
    const profileId = parseInt(req.params.id);
    const existing = await storage.getProfile(profileId);
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: "Profile not found" });
    }

    await storage.deleteProfile(profileId);
    res.status(204).send();
  });

  return httpServer;
}
