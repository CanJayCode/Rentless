import { IStorage } from './storage';
import { MemStorage } from './storage';
import { FirestoreStorage } from './firestore-storage';

class StorageManager {
  private storage: IStorage;
  private isFirestoreAvailable: boolean = false;

  constructor() {
    this.storage = this.initializeStorage();
  }

  private initializeStorage(): IStorage {
    // Check if Firebase credentials are available
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Firebase credentials found, attempting to use Firestore storage...');
      this.isFirestoreAvailable = true;
      return new FirestoreStorage();
    } else {
      console.log('Firebase credentials not found, using in-memory storage');
      this.isFirestoreAvailable = false;
      return new MemStorage();
    }
  }

  async getStorage(): Promise<IStorage> {
    // If Firestore is configured but fails, fallback to in-memory
    if (this.isFirestoreAvailable) {
      try {
        // Test the connection with a simple operation
        await this.storage.getSettings();
        return this.storage;
      } catch (error) {
        console.error('Firestore connection failed, falling back to in-memory storage:', error);
        this.isFirestoreAvailable = false;
        this.storage = new MemStorage();
        console.log('Successfully switched to in-memory storage');
        return this.storage;
      }
    }
    
    return this.storage;
  }

  isUsingFirestore(): boolean {
    return this.isFirestoreAvailable;
  }
}

export const storageManager = new StorageManager();