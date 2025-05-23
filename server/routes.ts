import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeviceSchema, insertBandwidthMetricSchema, insertSystemMetricSchema, insertSecurityEventSchema, insertIdsRuleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Device routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }
      
      const device = await storage.getDevice(id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.put("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }
      
      const updateData = insertDeviceSchema.partial().parse(req.body);
      const device = await storage.updateDevice(id, updateData);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid device ID" });
      }
      
      const deleted = await storage.deleteDevice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Bandwidth metrics routes
  app.get("/api/bandwidth-metrics", async (req, res) => {
    try {
      const deviceId = req.query.deviceId ? parseInt(req.query.deviceId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const metrics = await storage.getBandwidthMetrics(deviceId, limit);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bandwidth metrics" });
    }
  });

  app.post("/api/bandwidth-metrics", async (req, res) => {
    try {
      const metricData = insertBandwidthMetricSchema.parse(req.body);
      const metric = await storage.createBandwidthMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bandwidth metric" });
    }
  });

  // System metrics routes
  app.get("/api/system-metrics/latest", async (req, res) => {
    try {
      const metrics = await storage.getLatestSystemMetrics();
      if (!metrics) {
        return res.status(404).json({ message: "No system metrics found" });
      }
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  app.get("/api/system-metrics/history", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const metrics = await storage.getSystemMetricsHistory(limit);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system metrics history" });
    }
  });

  app.post("/api/system-metrics", async (req, res) => {
    try {
      const metricData = insertSystemMetricSchema.parse(req.body);
      const metric = await storage.createSystemMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create system metric" });
    }
  });

  // Generate mock real-time data for demonstration
  app.post("/api/generate-mock-data", async (req, res) => {
    try {
      // Generate bandwidth metrics for the last 24 hours
      const now = new Date();
      const devices = await storage.getDevices();
      
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
        
        // Generate bandwidth metrics for each device
        for (const device of devices) {
          if (device.status === "online" || device.status === "warning") {
            await storage.createBandwidthMetric({
              deviceId: device.id,
              incoming: Math.random() * 3,
              outgoing: Math.random() * 2.5,
            });
          }
        }
        
        // Generate system metrics
        await storage.createSystemMetric({
          activeDevices: Math.floor(120 + Math.random() * 10),
          totalBandwidth: 2 + Math.random() * 1,
          warnings: Math.floor(Math.random() * 5),
          uptime: 99 + Math.random() * 1,
        });
      }
      
      res.json({ message: "Mock data generated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate mock data" });
    }
  });

  // Security events routes (IDS)
  app.get("/api/security-events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const status = req.query.status as string;
      
      let events;
      if (status) {
        events = await storage.getSecurityEventsByStatus(status, limit);
      } else {
        events = await storage.getSecurityEvents(limit);
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch security events" });
    }
  });

  app.post("/api/security-events", async (req, res) => {
    try {
      const eventData = insertSecurityEventSchema.parse(req.body);
      const event = await storage.createSecurityEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create security event" });
    }
  });

  app.put("/api/security-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const updateData = insertSecurityEventSchema.partial().parse(req.body);
      const event = await storage.updateSecurityEvent(id, updateData);
      
      if (!event) {
        return res.status(404).json({ message: "Security event not found" });
      }
      
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update security event" });
    }
  });

  app.delete("/api/security-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const deleted = await storage.deleteSecurityEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Security event not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete security event" });
    }
  });

  // IDS rules routes
  app.get("/api/ids-rules", async (req, res) => {
    try {
      const rules = await storage.getIdsRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch IDS rules" });
    }
  });

  app.get("/api/ids-rules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid rule ID" });
      }
      
      const rule = await storage.getIdsRule(id);
      if (!rule) {
        return res.status(404).json({ message: "IDS rule not found" });
      }
      
      res.json(rule);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch IDS rule" });
    }
  });

  app.post("/api/ids-rules", async (req, res) => {
    try {
      const ruleData = insertIdsRuleSchema.parse(req.body);
      const rule = await storage.createIdsRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create IDS rule" });
    }
  });

  app.put("/api/ids-rules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid rule ID" });
      }
      
      const updateData = insertIdsRuleSchema.partial().parse(req.body);
      const rule = await storage.updateIdsRule(id, updateData);
      
      if (!rule) {
        return res.status(404).json({ message: "IDS rule not found" });
      }
      
      res.json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update IDS rule" });
    }
  });

  app.delete("/api/ids-rules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid rule ID" });
      }
      
      const deleted = await storage.deleteIdsRule(id);
      if (!deleted) {
        return res.status(404).json({ message: "IDS rule not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete IDS rule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
