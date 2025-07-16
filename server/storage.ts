import { rooms, settings, type Room, type InsertRoom, type Settings, type InsertSettings, type UpdateRoom } from "@shared/schema";

export interface IStorage {
  // Room operations
  getRooms(): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, data: Partial<Room>): Promise<Room | undefined>;
  updateRoomForMonth(roomId: number, month: string, data: UpdateRoom): Promise<Room | undefined>;
  
  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
  
  // Data management
  resetMonthData(month: string): Promise<void>;
  resetAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<number, Room>;
  private settings: Settings;
  private currentRoomId: number;

  constructor() {
    this.rooms = new Map();
    this.settings = {
      id: 1,
      baseRent: 3000,
      unitRate: 10,
    };
    this.currentRoomId = 1;
    this.initializeRooms();
  }

  private initializeRooms() {
    const tenantNames = [
      "Raj Kumar", "Priya Sharma", "Ahmed Khan", "Maria Jose", "David Wong",
      "Lisa Chen", "James Miller", "Sarah Johnson", "Mike Davis", "Anna Wilson",
      "Robert Brown", "Emily Taylor", "Carlos Garcia", "Jessica Lee", "Thomas Clark", "Linda Martinez"
    ];

    for (let i = 1; i <= 16; i++) {
      const room: Room = {
        id: i,
        roomNumber: `Room ${i.toString().padStart(2, '0')}`,
        tenantName: tenantNames[i - 1],
        monthlyData: {},
      };
      this.rooms.set(i, room);
    }
    this.currentRoomId = 17;
  }

  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.currentRoomId++;
    const room: Room = { ...insertRoom, id };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: number, data: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const updatedRoom = { ...room, ...data };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async updateRoomForMonth(roomId: number, month: string, data: UpdateRoom): Promise<Room | undefined> {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const monthlyData = (room.monthlyData as any) || {};
    const currentMonthData = monthlyData[month] || {};

    // Calculate units consumed
    const unitsConsumed = Math.max(0, data.currentReading - data.previousReading);
    const electricityAmountDue = unitsConsumed * this.settings.unitRate;

    // Calculate balances
    const rentBalance = this.settings.baseRent - data.rentPaid;
    const electricityBalance = electricityAmountDue - data.electricityPaid;

    // Determine statuses
    const rentStatus = data.rentPaid === 0 ? "pending" : data.rentPaid < this.settings.baseRent ? "partial" : "paid";
    const electricityStatus = data.electricityPaid >= electricityAmountDue ? "paid" : "pending";

    const updatedMonthData = {
      ...currentMonthData,
      rent: {
        amountDue: this.settings.baseRent,
        amountPaid: data.rentPaid,
        balance: rentBalance,
        date: data.rentDate,
        notes: data.rentNotes,
        status: rentStatus,
      },
      electricity: {
        previousReading: data.previousReading,
        currentReading: data.currentReading,
        unitsConsumed,
        amountDue: electricityAmountDue,
        amountPaid: data.electricityPaid,
        balance: electricityBalance,
        date: data.electricityDate,
        notes: data.electricityNotes,
        status: electricityStatus,
      },
    };

    monthlyData[month] = updatedMonthData;

    const updatedRoom = {
      ...room,
      tenantName: data.tenantName,
      monthlyData,
    };

    this.rooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }

  async resetMonthData(month: string): Promise<void> {
    for (const [id, room] of this.rooms.entries()) {
      const monthlyData = (room.monthlyData as any) || {};
      delete monthlyData[month];
      this.rooms.set(id, { ...room, monthlyData });
    }
  }

  async resetAllData(): Promise<void> {
    for (const [id, room] of this.rooms.entries()) {
      this.rooms.set(id, { ...room, monthlyData: {} });
    }
  }
}

export const storage = new MemStorage();
