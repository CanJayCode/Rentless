import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { rooms, settings, type Room, type InsertRoom, type Settings, type InsertSettings, type UpdateRoom } from "@shared/schema";
import { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private initialized: boolean = false;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for PostgreSQL storage");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      try {
        // Check if tables exist and have data
        const existingSettings = await this.db.select().from(settings).limit(1);
        
        if (existingSettings.length === 0) {
          // Initialize default settings
          await this.db.insert(settings).values({
            baseRent: 3000,
            unitRate: 10,
          });
        }

        // Check if we have any rooms, if not create sample data
        const existingRooms = await this.db.select().from(rooms).limit(1);
        
        if (existingRooms.length === 0) {
          // Initialize sample rooms
          const tenantNames = [
            "Raj Kumar", "Priya Sharma", "Ahmed Khan", "Maria Jose", "David Wong",
            "Lisa Chen", "James Miller", "Sarah Johnson", "Mike Davis", "Anna Wilson",
            "Robert Brown", "Emily Taylor", "Carlos Garcia", "Jessica Lee", "Thomas Clark", "Linda Martinez"
          ];

          const roomsData = [];
          for (let i = 1; i <= 16; i++) {
            roomsData.push({
              roomNumber: `Room ${i.toString().padStart(2, '0')}`,
              tenantName: tenantNames[i - 1],
              monthlyData: {},
            });
          }
          
          await this.db.insert(rooms).values(roomsData);
        }

        this.initialized = true;
      } catch (error) {
        console.error('Error initializing PostgreSQL storage:', error);
        throw error;
      }
    }
  }

  async getRooms(): Promise<Room[]> {
    await this.ensureInitialized();
    return await this.db.select().from(rooms).orderBy(rooms.id);
  }

  async getRoom(id: number): Promise<Room | undefined> {
    await this.ensureInitialized();
    const result = await this.db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
    return result[0];
  }

  async getRoomForMonth(id: number, month: string): Promise<Room | undefined> {
    await this.ensureInitialized();
    const room = await this.getRoom(id);
    if (!room) return undefined;

    const monthlyData = (room.monthlyData as any) || {};
    const currentMonthData = monthlyData[month];

    // If current month has no data, calculate carry-forward
    if (!currentMonthData) {
      const previousMonth = this.getPreviousMonth(month);
      const previousMonthData = monthlyData[previousMonth];

      if (previousMonthData) {
        const settings = await this.getSettings();
        
        // Calculate carry-forward amounts
        const rentCarryForward = previousMonthData.rent?.balance || 0;
        const electricityCarryForward = previousMonthData.electricity?.balance || 0;

        // Create month data with carry-forward
        const newMonthData = {
          rent: {
            amountDue: settings.baseRent + rentCarryForward,
            amountPaid: 0,
            balance: settings.baseRent + rentCarryForward,
            carryForward: rentCarryForward,
            carryForwardFrom: rentCarryForward > 0 ? previousMonth : undefined,
            status: "pending" as const,
          },
          electricity: {
            previousReading: previousMonthData.electricity?.currentReading || 0,
            currentReading: 0,
            unitsConsumed: 0,
            amountDue: electricityCarryForward,
            amountPaid: 0,
            balance: electricityCarryForward,
            carryForward: electricityCarryForward,
            carryForwardFrom: electricityCarryForward > 0 ? previousMonth : undefined,
            status: "pending" as const,
          }
        };

        // Update room with new month data
        const updatedMonthlyData = { ...monthlyData, [month]: newMonthData };
        await this.db.update(rooms)
          .set({ monthlyData: updatedMonthlyData })
          .where(eq(rooms.id, id));

        return { ...room, monthlyData: updatedMonthlyData };
      }
    }

    return room;
  }

  private getPreviousMonth(month: string): string {
    const [year, monthNum] = month.split('-').map(Number);
    const date = new Date(year, monthNum - 2); // monthNum - 1 for 0-indexed, -1 more for previous month
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    await this.ensureInitialized();
    const result = await this.db.insert(rooms).values(room).returning();
    return result[0];
  }

  async updateRoom(id: number, data: Partial<Room>): Promise<Room | undefined> {
    await this.ensureInitialized();
    const result = await this.db.update(rooms).set(data).where(eq(rooms.id, id)).returning();
    return result[0];
  }

  async updateRoomForMonth(roomId: number, month: string, data: UpdateRoom): Promise<Room | undefined> {
    await this.ensureInitialized();
    const room = await this.getRoomForMonth(roomId, month);
    if (!room) return undefined;

    const settings = await this.getSettings();
    const monthlyData = (room.monthlyData as any) || {};
    const currentMonthData = monthlyData[month] || {};

    // Calculate electricity units and cost
    const unitsConsumed = Math.max(0, data.currentReading - data.previousReading);
    const electricityAmount = unitsConsumed * settings.unitRate;

    // Get carry-forward amounts
    const rentCarryForward = currentMonthData.rent?.carryForward || 0;
    const electricityCarryForward = currentMonthData.electricity?.carryForward || 0;

    // Calculate new amounts
    const totalRentDue = settings.baseRent + rentCarryForward;
    const totalElectricityDue = electricityAmount + electricityCarryForward;

    const newMonthData = {
      rent: {
        amountDue: totalRentDue,
        amountPaid: data.rentPaid,
        balance: totalRentDue - data.rentPaid,
        carryForward: rentCarryForward,
        carryForwardFrom: currentMonthData.rent?.carryForwardFrom,
        date: data.rentDate,
        notes: data.rentNotes,
        status: (data.rentPaid >= totalRentDue ? "paid" : data.rentPaid > 0 ? "partial" : "pending") as const,
      },
      electricity: {
        previousReading: data.previousReading,
        currentReading: data.currentReading,
        unitsConsumed,
        amountDue: totalElectricityDue,
        amountPaid: data.electricityPaid,
        balance: totalElectricityDue - data.electricityPaid,
        carryForward: electricityCarryForward,
        carryForwardFrom: currentMonthData.electricity?.carryForwardFrom,
        date: data.electricityDate,
        notes: data.electricityNotes,
        status: (data.electricityPaid >= totalElectricityDue ? "paid" : "pending") as const,
      }
    };

    const updatedMonthlyData = { ...monthlyData, [month]: newMonthData };
    
    const updatedRoom = await this.db.update(rooms)
      .set({ 
        tenantName: data.tenantName,
        monthlyData: updatedMonthlyData 
      })
      .where(eq(rooms.id, roomId))
      .returning();

    return updatedRoom[0];
  }

  async getSettings(): Promise<Settings> {
    await this.ensureInitialized();
    const result = await this.db.select().from(settings).limit(1);
    return result[0];
  }

  async updateSettings(newSettings: Partial<InsertSettings>): Promise<Settings> {
    await this.ensureInitialized();
    const currentSettings = await this.getSettings();
    const result = await this.db.update(settings)
      .set(newSettings)
      .where(eq(settings.id, currentSettings.id))
      .returning();
    return result[0];
  }

  async resetMonthData(month: string): Promise<void> {
    await this.ensureInitialized();
    const allRooms = await this.getRooms();
    
    for (const room of allRooms) {
      const monthlyData = { ...(room.monthlyData as any) };
      if (monthlyData[month]) {
        delete monthlyData[month];
        await this.db.update(rooms)
          .set({ monthlyData })
          .where(eq(rooms.id, room.id));
      }
    }
  }

  async resetAllData(): Promise<void> {
    await this.ensureInitialized();
    await this.db.update(rooms).set({ monthlyData: {} });
  }
}