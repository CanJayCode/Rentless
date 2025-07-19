import type { Express } from "express";
import { createServer, type Server } from "http";
import { storageManager } from "./storage-manager";
import { updateRoomSchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get room by ID
  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const id = parseInt(req.params.id);
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  // Get room by ID for specific month (with carry-forward logic)
  app.get("/api/rooms/:id/month/:month", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const id = parseInt(req.params.id);
      const month = req.params.month;
      const room = await storage.getRoomForMonth(id, month);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  // Update room for specific month
  app.post("/api/rooms/:id/month/:month", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const id = parseInt(req.params.id);
      const month = req.params.month;
      const data = updateRoomSchema.parse(req.body);
      
      const room = await storage.updateRoomForMonth(id, month, data);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.post("/api/settings", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const data = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Reset month data
  app.post("/api/data/reset-month", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const { month } = req.body;
      if (!month) {
        return res.status(400).json({ message: "Month is required" });
      }
      
      await storage.resetMonthData(month);
      res.json({ message: "Month data reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset month data" });
    }
  });

  // Reset all data
  app.post("/api/data/reset-all", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      await storage.resetAllData();
      res.json({ message: "All data reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset all data" });
    }
  });

  // Export data as CSV
  app.get("/api/export/csv/:month", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const month = req.params.month;
      const rooms = await storage.getRooms();
      
      const csvHeaders = [
        "Room",
        "Tenant",
        "Rent Status",
        "Rent Amount",
        "Rent Paid",
        "Rent Balance",
        "Units Consumed",
        "Electricity Amount",
        "Electricity Paid",
        "Electricity Balance",
        "Electricity Status",
        "Notes"
      ];

      const csvRows = rooms.map(room => {
        const monthData = (room.monthlyData as any)?.[month];
        const rent = monthData?.rent || {};
        const electricity = monthData?.electricity || {};

        return [
          room.roomNumber,
          room.tenantName,
          rent.status || "pending",
          rent.amountDue || 0,
          rent.amountPaid || 0,
          rent.balance || 0,
          electricity.unitsConsumed || 0,
          electricity.amountDue || 0,
          electricity.amountPaid || 0,
          electricity.balance || 0,
          electricity.status || "pending",
          `${rent.notes || ""} | ${electricity.notes || ""}`.trim()
        ];
      });

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="rooms-${month}.csv"`);
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Health check endpoint for Render
  app.get("/api/status", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      // Test database connectivity by trying to get settings
      await storage.getSettings();
      res.json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        database: "connected"
      });
    } catch (error) {
      res.status(503).json({ 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
