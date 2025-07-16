import { getDb, COLLECTIONS } from './firebase';
import { IStorage } from './storage';
import { Room, InsertRoom, Settings, InsertSettings, UpdateRoom } from '../shared/schema';

export class FirestoreStorage implements IStorage {
  private getFirestore() {
    const db = getDb();
    if (!db) {
      throw new Error('Firestore is not initialized. Please check your Firebase credentials.');
    }
    return db;
  }
  private async initializeDefaultData() {
    const db = this.getFirestore();
    
    try {
      // Check if settings exist
      const settingsDoc = await db.collection(COLLECTIONS.SETTINGS).doc('default').get();
    
    if (!settingsDoc.exists) {
      // Create default settings
      await db.collection(COLLECTIONS.SETTINGS).doc('default').set({
        id: 1,
        baseRent: 3000,
        unitRate: 10,
      });
    }

    // Check if rooms exist
    const roomsSnapshot = await db.collection(COLLECTIONS.ROOMS).get();
    
    if (roomsSnapshot.empty) {
      // Create default rooms
      const batch = db.batch();
      
      for (let i = 1; i <= 16; i++) {
        const roomRef = db.collection(COLLECTIONS.ROOMS).doc(i.toString());
        batch.set(roomRef, {
          id: i,
          roomNumber: `Room ${i.toString().padStart(2, '0')}`,
          tenantName: `Tenant ${i}`,
          monthlyData: {},
        });
      }
      
      await batch.commit();
    }
    } catch (error) {
      console.error('Error initializing Firestore data:', error);
      throw new Error('Firestore database is not available. Please create the database first.');
    }
  }

  async getRooms(): Promise<Room[]> {
    try {
      const db = this.getFirestore();
      await this.initializeDefaultData();
      
      const snapshot = await db.collection(COLLECTIONS.ROOMS).orderBy('id').get();
    const rooms: Room[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      rooms.push({
        id: data.id,
        roomNumber: data.roomNumber,
        tenantName: data.tenantName,
        monthlyData: data.monthlyData || {},
      });
    });
    
    return rooms;
    } catch (error) {
      console.error('Error fetching rooms from Firestore:', error);
      throw error;
    }
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const db = this.getFirestore();
    const doc = await db.collection(COLLECTIONS.ROOMS).doc(id.toString()).get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    const data = doc.data()!;
    return {
      id: data.id,
      roomNumber: data.roomNumber,
      tenantName: data.tenantName,
      monthlyData: data.monthlyData || {},
    };
  }

  async getRoomForMonth(id: number, month: string): Promise<Room | undefined> {
    const room = await this.getRoom(id);
    if (!room) return undefined;

    const settings = await this.getSettings();
    const monthlyData = room.monthlyData as any;
    const currentMonthData = monthlyData[month] || {};

    // Calculate carry-forward logic
    const previousMonth = this.getPreviousMonth(month);
    const previousMonthData = monthlyData[previousMonth];

    let rentCarryForward = 0;
    let electricityCarryForward = 0;
    let carryForwardFrom = '';

    if (previousMonthData && !currentMonthData.rent?.amountPaid) {
      const rentDue = settings.baseRent;
      const rentPaid = previousMonthData.rent?.amountPaid || 0;
      const rentBalance = rentDue - rentPaid;
      
      if (rentBalance > 0) {
        rentCarryForward = rentBalance;
        carryForwardFrom = this.formatMonthName(previousMonth);
      }
    }

    if (previousMonthData && !currentMonthData.electricity?.amountPaid) {
      const unitsUsed = (previousMonthData.electricity?.currentReading || 0) - 
                       (previousMonthData.electricity?.previousReading || 0);
      const electricityDue = unitsUsed * settings.unitRate;
      const electricityPaid = previousMonthData.electricity?.amountPaid || 0;
      const electricityBalance = electricityDue - electricityPaid;
      
      if (electricityBalance > 0) {
        electricityCarryForward = electricityBalance;
        if (!carryForwardFrom) {
          carryForwardFrom = this.formatMonthName(previousMonth);
        }
      }
    }

    // Create updated room with carry-forward data
    const updatedRoom: Room = {
      ...room,
      monthlyData: {
        ...room.monthlyData,
        [month]: {
          ...currentMonthData,
          rent: {
            ...currentMonthData.rent,
            carryForward: rentCarryForward,
            carryForwardFrom: carryForwardFrom,
          },
          electricity: {
            ...currentMonthData.electricity,
            carryForward: electricityCarryForward,
            carryForwardFrom: carryForwardFrom,
            previousReading: currentMonthData.electricity?.previousReading || 
                           previousMonthData?.electricity?.currentReading || 0,
          },
        },
      },
    };

    return updatedRoom;
  }

  private getPreviousMonth(month: string): string {
    const date = new Date(month + '-01');
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().substring(0, 7);
  }

  private formatMonthName(month: string): string {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const db = this.getFirestore();
    // Get the next available ID
    const snapshot = await db.collection(COLLECTIONS.ROOMS).get();
    const maxId = snapshot.docs.reduce((max, doc) => {
      const data = doc.data();
      return Math.max(max, data.id || 0);
    }, 0);
    
    const newId = maxId + 1;
    const room: Room = {
      ...insertRoom,
      id: newId,
      monthlyData: {},
    };

    await db.collection(COLLECTIONS.ROOMS).doc(newId.toString()).set(room);
    return room;
  }

  async updateRoom(id: number, data: Partial<Room>): Promise<Room | undefined> {
    const db = this.getFirestore();
    const roomRef = db.collection(COLLECTIONS.ROOMS).doc(id.toString());
    const doc = await roomRef.get();
    
    if (!doc.exists) {
      return undefined;
    }

    await roomRef.update(data);
    
    const updatedDoc = await roomRef.get();
    const updatedData = updatedDoc.data()!;
    
    return {
      id: updatedData.id,
      roomNumber: updatedData.roomNumber,
      tenantName: updatedData.tenantName,
      monthlyData: updatedData.monthlyData || {},
    };
  }

  async updateRoomForMonth(roomId: number, month: string, data: UpdateRoom): Promise<Room | undefined> {
    const db = this.getFirestore();
    const room = await this.getRoom(roomId);
    if (!room) return undefined;

    const monthlyData = room.monthlyData as any;
    const currentMonthData = monthlyData[month] || {};

    // Update the monthly data
    const updatedMonthData = {
      ...currentMonthData,
      rent: {
        ...currentMonthData.rent,
        amountPaid: data.rentPaid,
        date: data.rentDate,
        notes: data.rentNotes,
      },
      electricity: {
        ...currentMonthData.electricity,
        previousReading: data.previousReading,
        currentReading: data.currentReading,
        amountPaid: data.electricityPaid,
        date: data.electricityDate,
        notes: data.electricityNotes,
      },
    };

    const updatedRoom: Room = {
      ...room,
      tenantName: data.tenantName,
      monthlyData: {
        ...room.monthlyData,
        [month]: updatedMonthData,
      },
    };

    await db.collection(COLLECTIONS.ROOMS).doc(roomId.toString()).set(updatedRoom);
    return updatedRoom;
  }

  async getSettings(): Promise<Settings> {
    const db = this.getFirestore();
    await this.initializeDefaultData();
    
    const doc = await db.collection(COLLECTIONS.SETTINGS).doc('default').get();
    
    if (!doc.exists) {
      throw new Error('Settings not found');
    }
    
    const data = doc.data()!;
    return {
      id: data.id,
      baseRent: data.baseRent,
      unitRate: data.unitRate,
    };
  }

  async updateSettings(newSettings: Partial<InsertSettings>): Promise<Settings> {
    const db = this.getFirestore();
    const currentSettings = await this.getSettings();
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
    };

    await db.collection(COLLECTIONS.SETTINGS).doc('default').set(updatedSettings);
    return updatedSettings;
  }

  async resetMonthData(month: string): Promise<void> {
    const db = this.getFirestore();
    const rooms = await this.getRooms();
    const batch = db.batch();
    
    for (const room of rooms) {
      const monthlyData = room.monthlyData as any;
      if (monthlyData[month]) {
        delete monthlyData[month];
        const roomRef = db.collection(COLLECTIONS.ROOMS).doc(room.id.toString());
        batch.update(roomRef, { monthlyData });
      }
    }
    
    await batch.commit();
  }

  async resetAllData(): Promise<void> {
    const db = this.getFirestore();
    const batch = db.batch();
    
    // Reset all rooms to default state
    for (let i = 1; i <= 16; i++) {
      const roomRef = db.collection(COLLECTIONS.ROOMS).doc(i.toString());
      batch.set(roomRef, {
        id: i,
        roomNumber: `Room ${i.toString().padStart(2, '0')}`,
        tenantName: `Tenant ${i}`,
        monthlyData: {},
      });
    }
    
    // Reset settings to default
    const settingsRef = db.collection(COLLECTIONS.SETTINGS).doc('default');
    batch.set(settingsRef, {
      id: 1,
      baseRent: 3000,
      unitRate: 10,
    });
    
    await batch.commit();
  }
}