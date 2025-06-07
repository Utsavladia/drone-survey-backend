"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
class SocketService {
    constructor(server) {
        console.log('Initializing Socket.IO server...');
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            console.log('Total connected clients:', this.io.engine.clientsCount);
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                console.log('Remaining connected clients:', this.io.engine.clientsCount);
            });
        });
    }
    emitDroneUpdate(drone) {
        console.log('Emitting drone update to all clients:', {
            droneId: drone._id,
            status: drone.status,
            batteryLevel: drone.batteryLevel
        });
        this.io.emit('drone:update', drone);
    }
    emitMissionUpdate(mission) {
        console.log('Emitting mission update to all clients:', mission);
        this.io.emit('mission:update', mission);
    }
    get socketIO() {
        return this.io;
    }
}
exports.default = SocketService;
