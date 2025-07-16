"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageManager = void 0;
const storage_1 = require("./storage");
const firestore_storage_1 = require("./firestore-storage");
class StorageManager {
    constructor() {
        this.isFirestoreAvailable = false;
        this.storage = this.initializeStorage();
    }
    initializeStorage() {
        // Check if Firebase credentials are available
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            console.log('Firebase credentials found, attempting to use Firestore storage...');
            this.isFirestoreAvailable = true;
            return new firestore_storage_1.FirestoreStorage();
        }
        else {
            console.log('Firebase credentials not found, using in-memory storage');
            this.isFirestoreAvailable = false;
            return new storage_1.MemStorage();
        }
    }
    async getStorage() {
        // If Firestore is configured but fails, fallback to in-memory
        if (this.isFirestoreAvailable) {
            try {
                // Test the connection with a simple operation
                await this.storage.getSettings();
                return this.storage;
            }
            catch (error) {
                console.error('Firestore connection failed, falling back to in-memory storage:', error);
                this.isFirestoreAvailable = false;
                this.storage = new storage_1.MemStorage();
                console.log('Successfully switched to in-memory storage');
                return this.storage;
            }
        }
        return this.storage;
    }
    isUsingFirestore() {
        return this.isFirestoreAvailable;
    }
}
exports.storageManager = new StorageManager();
//# sourceMappingURL=storage-manager.js.map