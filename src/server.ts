import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import missionRoutes from './routes/missionRoutes';
import droneRoutes from './routes/droneRoutes';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/missions', missionRoutes);
app.use('/api/drones', droneRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/drone-survey')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 