import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongoConnected = false;
const fallbackDbPath = path.join(__dirname, '..', 'data', 'tasks_db.json');

// Ensure data directory exists
const ensureDataDirExists = () => {
  const dir = path.dirname(fallbackDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(fallbackDbPath)) {
    fs.writeFileSync(fallbackDbPath, JSON.stringify([], null, 2), 'utf-8');
  }
};

export const connectDB = async () => {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    console.warn('\n=============================================================');
    console.warn('[WARN] MONGODB_URI is not defined in the environment variables.');
    console.warn('[WARN] Running in LOCAL FILE DATABASE fallback mode.');
    console.warn('=============================================================\n');
    ensureDataDirExists();
    return false;
  }

  try {
    // Set connection timeout to 3 seconds for quick local fallback
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`\n[SUCCESS] MongoDB Connected: ${conn.connection.host}\n`);
    mongoConnected = true;
    return true;
  } catch (error) {
    console.error('\n=============================================================');
    console.error(`[ERROR] MongoDB Connection Failed: ${error.message}`);
    console.error('[WARN] Falling back to LOCAL FILE DATABASE mode...');
    console.error('=============================================================\n');
    ensureDataDirExists();
    mongoConnected = false;
    return false;
  }
};

export const isMongoConnected = () => {
  return mongoConnected && mongoose.connection.readyState === 1;
};

export const getFallbackDbPath = () => {
  ensureDataDirExists();
  return fallbackDbPath;
};
