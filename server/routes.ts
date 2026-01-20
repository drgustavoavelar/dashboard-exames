import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.dataPoints.list.path, async (req, res) => {
    const points = await storage.getDataPoints();
    res.json(points);
  });

  app.post(api.dataPoints.create.path, async (req, res) => {
    try {
      const input = api.dataPoints.create.input.parse(req.body);
      const point = await storage.createDataPoint(input);
      res.status(201).json(point);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed data if empty
  const existing = await storage.getDataPoints();
  if (existing.length === 0) {
    await storage.createDataPoint({ label: "Jan", value: 400 });
    await storage.createDataPoint({ label: "Feb", value: 300 });
    await storage.createDataPoint({ label: "Mar", value: 600 });
    await storage.createDataPoint({ label: "Apr", value: 800 });
    await storage.createDataPoint({ label: "May", value: 500 });
  }

  return httpServer;
}
