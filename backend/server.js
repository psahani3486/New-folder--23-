import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for easier testing/deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Use Task routes
app.use('/api/tasks', taskRoutes);

// 404 Route handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API Endpoint ${req.originalUrl} Not Found` });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets in production if dist folder is available
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Serve the index.html for all frontend routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('MERN Task Tracker API is running...');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Start database and then server
const startServer = async () => {
  // Connect to DB (will fallback gracefully to JSON file if MongoDB is down)
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[SERVER] Express running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
