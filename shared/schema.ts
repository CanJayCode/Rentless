import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  tenantName: text("tenant_name").notNull(),
  monthlyData: jsonb("monthly_data").default({}),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  baseRent: integer("base_rent").notNull().default(3000),
  unitRate: integer("unit_rate").notNull().default(10),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const updateRoomSchema = z.object({
  tenantName: z.string().min(1, "Tenant name is required"),
  rentPaid: z.number().min(0, "Rent paid must be positive"),
  rentDate: z.string().optional(),
  rentNotes: z.string().optional(),
  previousReading: z.number().min(0, "Previous reading must be positive"),
  currentReading: z.number().min(0, "Current reading must be positive"),
  electricityPaid: z.number().min(0, "Electricity paid must be positive"),
  electricityDate: z.string().optional(),
  electricityNotes: z.string().optional(),
});

export const monthlyDataSchema = z.object({
  rent: z.object({
    amountDue: z.number().default(3000),
    amountPaid: z.number().default(0),
    balance: z.number().default(3000),
    date: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["paid", "partial", "pending"]).default("pending"),
  }).optional(),
  electricity: z.object({
    previousReading: z.number().default(0),
    currentReading: z.number().default(0),
    unitsConsumed: z.number().default(0),
    amountDue: z.number().default(0),
    amountPaid: z.number().default(0),
    balance: z.number().default(0),
    date: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["paid", "pending"]).default("pending"),
  }).optional(),
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type UpdateRoom = z.infer<typeof updateRoomSchema>;
export type MonthlyData = z.infer<typeof monthlyDataSchema>;
