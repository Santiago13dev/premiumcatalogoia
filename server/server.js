import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-catalog');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (simplified for now)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Components endpoints
app.get('/api/components', async (req, res) => {
  try {
    // This would normally fetch from database
    res.json({
      components: [],
      total: 0,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/components/:id', async (req, res) => {
  try {
    res.json({
      id: req.params.id,
      name: 'Sample Component',
      type: 'model',
      description: 'Sample description'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favorites endpoints (simplified)
app.get('/api/favorites', (req, res) => {
  res.json({ favorites: [] });
});

app.post('/api/favorites/:id', (req, res) => {
  res.json({ success: true, message: 'Added to favorites' });
});

app.delete('/api/favorites/:id', (req, res) => {
  res.json({ success: true, message: 'Removed from favorites' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;