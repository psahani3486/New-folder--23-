import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Serve static assets in production if needed, or simple status message for root
app.get('/', (req, res) => {
  res.send('MERN Task Tracker API is running...');
});

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
