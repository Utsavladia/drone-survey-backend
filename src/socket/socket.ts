import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { activeSimulations } from '../services/missionSimulationManager';

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  setupEventHandlers();
  startSimulationUpdates();

  return io;
}

function setupEventHandlers() {
  if (!io) return;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe_to_mission', (missionId: string) => {
      socket.join(`mission_${missionId}`);
      console.log(`Socket ${socket.id} subscribed to mission ${missionId}`);
    });

    socket.on('unsubscribe_from_mission', (missionId: string) => {
      socket.leave(`mission_${missionId}`);
      console.log(`Socket ${socket.id} unsubscribed from mission ${missionId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

function startSimulationUpdates() {
  if (!io) return;

  // Emit updates every second for all active simulations
  setInterval(() => {
    activeSimulations.forEach((simulation, missionId) => {
      if (simulation.currentPosition) {
        io?.to(`mission_${missionId}`).emit('drone_location_update', {
          missionId,
          location: {
            latitude: simulation.currentPosition.lat,
            longitude: simulation.currentPosition.lng,
            batteryLevel: simulation.batteryLevel,
            timestamp: new Date()
          }
        });
      }
    });
  }, 1000);
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO server not initialized');
  }
  return io;
} 