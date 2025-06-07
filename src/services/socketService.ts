import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IDrone } from '../models/Drone';

class SocketService {
  private io: Server;

  constructor(server: HttpServer) {
    console.log('Initializing Socket.IO server...');
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);
      console.log('Total connected clients:', this.io.engine.clientsCount);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        console.log('Remaining connected clients:', this.io.engine.clientsCount);
      });
    });
  }

  emitDroneUpdate(drone: IDrone) {
    console.log('Emitting drone update to all clients:', {
      droneId: drone._id,
      status: drone.status,
      batteryLevel: drone.batteryLevel
    });
    this.io.emit('drone:update', drone);
  }

  emitMissionUpdate(mission: any) {
    console.log('Emitting mission update to all clients:', mission);
    this.io.emit('mission:update', mission);
  }

  get socketIO() {
    return this.io;
  }
}

export default SocketService; 