import type { Express } from "express";
import { storageManager } from "./storage-manager";
import { updateRoomSchema, insertSettingsSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<void> {
  // Get all rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const rooms = await storage.getRooms();
      return res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return res.status(500).json({ message: "Failed to fetch rooms", error: error instanceof Error ? error.message : String(error) });
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
      return res.json(room);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch room" });
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
      return res.json(room);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch room" });
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
      
      return res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update room" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const settings = await storage.getSettings();
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.post("/api/settings", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const data = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(data);
      return res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update settings" });
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
      return res.json({ message: "Month data reset successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to reset month data" });
    }
  });

  // Reset all data
  app.post("/api/data/reset-all", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      await storage.resetAllData();
      return res.json({ message: "All data reset successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to reset all data" });
    }
  });

  // Export data as CSV
  app.get("/api/export/csv/:month", async (req, res) => {
    try {
      const storage = await storageManager.getStorage();
      const month = req.params.month;
      const rooms = await storage.getRooms();

      const csvHeaders = [
        "Room Number",
        "Tenant Name",
        "Rent Status",
        "Rent Due",
        "Rent Paid",
        "Rent Balance",
        "Electricity Units",
        "Electricity Due",
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
      return res.send(csvContent);
    } catch (error) {
      return res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Routes configured for Firebase Functions
}