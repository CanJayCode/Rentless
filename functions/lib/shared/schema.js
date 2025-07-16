"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyDataSchema = exports.updateRoomSchema = exports.insertSettingsSchema = exports.insertRoomSchema = exports.settings = exports.rooms = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
exports.rooms = (0, pg_core_1.pgTable)("rooms", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    roomNumber: (0, pg_core_1.text)("room_number").notNull().unique(),
    tenantName: (0, pg_core_1.text)("tenant_name").notNull(),
    monthlyData: (0, pg_core_1.jsonb)("monthly_data").default({}),
});
exports.settings = (0, pg_core_1.pgTable)("settings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    baseRent: (0, pg_core_1.integer)("base_rent").notNull().default(3000),
    unitRate: (0, pg_core_1.integer)("unit_rate").notNull().default(10),
});
exports.insertRoomSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rooms).omit({
    id: true,
});
exports.insertSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.settings).omit({
    id: true,
});
exports.updateRoomSchema = zod_1.z.object({
    tenantName: zod_1.z.string().min(1, "Tenant name is required"),
    rentPaid: zod_1.z.number().min(0, "Rent paid must be positive"),
    rentDate: zod_1.z.string().optional(),
    rentNotes: zod_1.z.string().optional(),
    previousReading: zod_1.z.number().min(0, "Previous reading must be positive"),
    currentReading: zod_1.z.number().min(0, "Current reading must be positive"),
    electricityPaid: zod_1.z.number().min(0, "Electricity paid must be positive"),
    electricityDate: zod_1.z.string().optional(),
    electricityNotes: zod_1.z.string().optional(),
});
exports.monthlyDataSchema = zod_1.z.object({
    rent: zod_1.z.object({
        amountDue: zod_1.z.number().default(3000),
        amountPaid: zod_1.z.number().default(0),
        balance: zod_1.z.number().default(3000),
        carryForward: zod_1.z.number().default(0),
        carryForwardFrom: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        status: zod_1.z.enum(["paid", "partial", "pending"]).default("pending"),
    }).optional(),
    electricity: zod_1.z.object({
        previousReading: zod_1.z.number().default(0),
        currentReading: zod_1.z.number().default(0),
        unitsConsumed: zod_1.z.number().default(0),
        amountDue: zod_1.z.number().default(0),
        amountPaid: zod_1.z.number().default(0),
        balance: zod_1.z.number().default(0),
        carryForward: zod_1.z.number().default(0),
        carryForwardFrom: zod_1.z.string().optional(),
        date: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        status: zod_1.z.enum(["paid", "pending"]).default("pending"),
    }).optional(),
});
//# sourceMappingURL=schema.js.map