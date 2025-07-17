import express from 'express';
import { registerRoutes } from '../dist/index.js';

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

// Register routes
registerRoutes(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Database status endpoint
app.get('/api/status', (req, res) => {
  const hasFirebaseCredentials = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL);
  res.json({
    status: 'running',
    database: hasFirebaseCredentials ? 'firestore' : 'in-memory',
    message: hasFirebaseCredentials ? 'Connected to Firebase Firestore' : 'Using in-memory storage - data will not persist. Add Firebase credentials to Vercel environment variables.',
    timestamp: new Date().toISOString()
  });
});

export default app;