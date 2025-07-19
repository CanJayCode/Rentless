import { IStorage } from './storage';
import { MemStorage } from './storage';
import { FirestoreStorage } from './firestore-storage';
import { PostgresStorage } from './postgres-storage';

class StorageManager {
  private storage: IStorage;
  private storageType: 'postgres' | 'firestore' | 'memory' = 'memory';

  constructor() {
    this.storage = this.initializeStorage();
  }

  private initializeStorage(): IStorage {
    // Priority 1: PostgreSQL (for production deployments like Render)
    if (process.env.DATABASE_URL) {
      console.log('DATABASE_URL found, using PostgreSQL storage');
      this.storageType = 'postgres';
      return new PostgresStorage();
    }
    
    // Priority 2: Firebase Firestore
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Firebase credentials found, attempting to use Firestore storage...');
      this.storageType = 'firestore';
      return new FirestoreStorage();
    }
    
    // Fallback: In-memory storage
    console.log('No database configuration found, using in-memory storage');
    this.storageType = 'memory';
    return new MemStorage();
  }

  async getStorage(): Promise<IStorage> {
    // Test the current storage connection
    try {
      await this.storage.getSettings();
      return this.storage;
    } catch (error) {
      console.error(`${this.storageType} storage connection failed, falling back:`, error);
      
      // Try fallback strategies
      if (this.storageType === 'postgres') {
        // PostgreSQL failed, try Firestore
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          console.log('Attempting Firestore fallback...');
          try {
            this.storage = new FirestoreStorage();
            this.storageType = 'firestore';
            await this.storage.getSettings();
            console.log('Successfully switched to Firestore storage');
            return this.storage;
          } catch (firestoreError) {
            console.error('Firestore fallback failed:', firestoreError);
          }
        }
        
        // Fall back to memory storage
        console.log('Using in-memory storage as final fallback');
        this.storage = new MemStorage();
        this.storageType = 'memory';
        return this.storage;
      }
      
      if (this.storageType === 'firestore') {
        // Firestore failed, fall back to memory
        console.log('Firestore failed, falling back to in-memory storage');
        this.storage = new MemStorage();
        this.storageType = 'memory';
        console.log('Successfully switched to in-memory storage');
        return this.storage;
      }
      
      // Memory storage should never fail, but just in case
      throw error;
    }
  }

  getStorageType(): string {
    return this.storageType;
  }

  isUsingPostgres(): boolean {
    return this.storageType === 'postgres';
  }

  isUsingFirestore(): boolean {
    return this.storageType === 'firestore';
  }

  isUsingMemory(): boolean {
    return this.storageType === 'memory';
  }
}

export const storageManager = new StorageManager();