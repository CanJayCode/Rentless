import express from 'express';

// Import necessary pieces from the compiled backend
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = express();

// Enable CORS for all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Parse JSON bodies
app.use(express.json());

// Firebase initialization
const initializeFirebase = () => {
  if (getApps().length === 0) {
    try {
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.log('Firebase credentials not found - using in-memory storage');
        return;
      }

      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (!privateKey.startsWith('-----BEGIN')) {
        try {
          privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
        } catch (error) {
          // If base64 decoding fails, treat as plain text
        }
      }
      
      privateKey = privateKey.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      console.log('Falling back to in-memory storage');
    }
  }
};

const getDb = () => {
  if (getApps().length === 0) {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      initializeFirebase();
    }
  }
  return getApps().length > 0 ? getFirestore() : null;
};

// In-memory storage as fallback
const memoryRooms = new Map();
const memorySettings = { id: 1, baseRent: 3000, unitRate: 10 };

// Initialize default data
for (let i = 1; i <= 16; i++) {
  memoryRooms.set(i, {
    id: i,
    roomNumber: `Room ${i.toString().padStart(2, '0')}`,
    tenantName: `Tenant ${i}`,
    monthlyData: {},
  });
}

// Storage functions
async function getRooms() {
  const db = getDb();
  if (db) {
    try {
      const snapshot = await db.collection('rooms').orderBy('id').get();
      const rooms = [];
      
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
      console.error('Firestore error, using memory storage:', error);
    }
  }
  
  return Array.from(memoryRooms.values());
}

async function getSettings() {
  const db = getDb();
  if (db) {
    try {
      const doc = await db.collection('settings').doc('default').get();
      if (doc.exists) {
        const data = doc.data();
        return {
          id: data.id,
          baseRent: data.baseRent,
          unitRate: data.unitRate,
        };
      }
    } catch (error) {
      console.error('Firestore error, using memory storage:', error);
    }
  }
  
  return memorySettings;
}

// API Routes
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await getRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
  }
});

app.get('/api/status', (req, res) => {
  const hasFirebaseCredentials = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL);
  res.json({
    status: 'running',
    database: hasFirebaseCredentials ? 'firestore' : 'in-memory',
    message: hasFirebaseCredentials ? 'Connected to Firebase Firestore' : 'Using in-memory storage - data will not persist. Add Firebase credentials to Vercel environment variables.',
    timestamp: new Date().toISOString()
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

export default app;