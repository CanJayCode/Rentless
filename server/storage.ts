import { rooms, settings, type Room, type InsertRoom, type Settings, type InsertSettings, type UpdateRoom } from "@shared/schema";

export interface IStorage {
  // Room operations
  getRooms(): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  getRoomForMonth(id: number, month: string): Promise<Room | undefined>;
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

  async getRoomForMonth(id: number, month: string): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const monthlyData = (room.monthlyData as any) || {};
    const currentMonthData = monthlyData[month];

    // If current month has no data, calculate carry-forward
    if (!currentMonthData) {
      const previousMonth = this.getPreviousMonth(month);
      const previousMonthData = monthlyData[previousMonth];
      
      if (previousMonthData) {
        const rentCarryForward = Math.max(0, (previousMonthData.rent?.balance || 0));
        const electricityCarryForward = Math.max(0, (previousMonthData.electricity?.balance || 0));
        
        // Create new month data with carry-forward
        const newMonthData = {
          rent: {
            amountDue: this.settings.baseRent + rentCarryForward,
            amountPaid: 0,
            balance: this.settings.baseRent + rentCarryForward,
            carryForward: rentCarryForward,
            carryForwardFrom: rentCarryForward > 0 ? this.formatMonthName(previousMonth) : undefined,
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
            carryForwardFrom: electricityCarryForward > 0 ? this.formatMonthName(previousMonth) : undefined,
            status: "pending" as const,
          },
        };
        
        // Update the room with carry-forward data
        monthlyData[month] = newMonthData;
        const updatedRoom = { ...room, monthlyData };
        this.rooms.set(id, updatedRoom);
        return updatedRoom;
      }
    }

    return room;
  }

  private getPreviousMonth(month: string): string {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  private formatMonthName(month: string): string {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.currentRoomId++;
    const room: Room = { ...insertRoom, id, monthlyData: {} };
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

    // Get existing carry-forward data or calculate it
    let rentCarryForward = currentMonthData.rent?.carryForward || 0;
    let rentCarryForwardFrom = currentMonthData.rent?.carryForwardFrom;
    let electricityCarryForward = currentMonthData.electricity?.carryForward || 0;
    let electricityCarryForwardFrom = currentMonthData.electricity?.carryForwardFrom;

    // If no existing data, check previous month for carry-forward
    if (!currentMonthData.rent && !currentMonthData.electricity) {
      const previousMonth = this.getPreviousMonth(month);
      const previousMonthData = monthlyData[previousMonth];
      
      if (previousMonthData) {
        rentCarryForward = Math.max(0, (previousMonthData.rent?.balance || 0));
        electricityCarryForward = Math.max(0, (previousMonthData.electricity?.balance || 0));
        
        if (rentCarryForward > 0) {
          rentCarryForwardFrom = this.formatMonthName(previousMonth);
        }
        if (electricityCarryForward > 0) {
          electricityCarryForwardFrom = this.formatMonthName(previousMonth);
        }
      }
    }

    // Calculate units consumed
    const unitsConsumed = Math.max(0, data.currentReading - data.previousReading);
    const electricityCurrentDue = unitsConsumed * this.settings.unitRate;
    const electricityTotalDue = electricityCurrentDue + electricityCarryForward;

    // Calculate total amounts due (including carry-forward)
    const rentTotalDue = this.settings.baseRent + rentCarryForward;

    // Calculate balances
    const rentBalance = rentTotalDue - data.rentPaid;
    const electricityBalance = electricityTotalDue - data.electricityPaid;

    // Determine statuses
    const rentStatus = data.rentPaid === 0 ? "pending" : data.rentPaid < rentTotalDue ? "partial" : "paid";
    const electricityStatus = data.electricityPaid >= electricityTotalDue ? "paid" : "pending";

    const updatedMonthData = {
      ...currentMonthData,
      rent: {
        amountDue: rentTotalDue,
        amountPaid: data.rentPaid,
        balance: rentBalance,
        carryForward: rentCarryForward,
        carryForwardFrom: rentCarryForwardFrom,
        date: data.rentDate,
        notes: data.rentNotes,
        status: rentStatus,
      },
      electricity: {
        previousReading: data.previousReading,
        currentReading: data.currentReading,
        unitsConsumed,
        amountDue: electricityTotalDue,
        amountPaid: data.electricityPaid,
        balance: electricityBalance,
        carryForward: electricityCarryForward,
        carryForwardFrom: electricityCarryForwardFrom,
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
    const roomEntries = Array.from(this.rooms.entries());
    for (const [id, room] of roomEntries) {
      const monthlyData = (room.monthlyData as any) || {};
      delete monthlyData[month];
      this.rooms.set(id, { ...room, monthlyData });
    }
  }

  async resetAllData(): Promise<void> {
    const roomEntries = Array.from(this.rooms.entries());
    for (const [id, room] of roomEntries) {
      this.rooms.set(id, { ...room, monthlyData: {} });
    }
  }
}

import { FirestoreStorage } from './firestore-storage';

// Function to create storage instance with error handling
function createStorage(): IStorage {
  // Check if Firebase credentials are available
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      console.log('Firebase credentials found, attempting to use Firestore storage...');
      return new FirestoreStorage();
    } catch (error) {
      console.error('Failed to initialize Firestore storage:', error);
      console.log('Falling back to in-memory storage');
      return new MemStorage();
    }
  } else {
    console.log('Firebase credentials not found, using in-memory storage');
    return new MemStorage();
  }
}

export const storage = createStorage();
