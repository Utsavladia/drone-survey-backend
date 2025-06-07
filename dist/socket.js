"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const Mission_1 = __importDefault(require("./models/Mission"));
const Drone_1 = __importDefault(require("./models/Drone"));
const activeMissions = new Map();
const initializeSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('missionControl', (_a) => __awaiter(void 0, [_a], void 0, function* ({ action, missionId }) {
            try {
                const mission = yield Mission_1.default.findById(missionId);
                if (!mission) {
                    socket.emit('error', { message: 'Mission not found' });
                    return;
                }
                let missionState = activeMissions.get(missionId);
                const droneId = mission.assignedDrone;
                switch (action) {
                    case 'start':
                        if (!missionState) {
                            missionState = {
                                currentWaypointIndex: 0,
                                progress: 0,
                                status: 'in-progress',
                                dronePosition: null
                            };
                            activeMissions.set(missionId, missionState);
                            // Set drone status to in-mission
                            yield Drone_1.default.findByIdAndUpdate(droneId, { status: 'in-mission' });
                            io.emit('droneStatus', { droneId, status: 'in-mission' });
                            startMissionSimulation(io, missionId, mission.flightPath, droneId);
                        }
                        break;
                    case 'pause':
                        if (missionState) {
                            missionState.status = 'paused';
                            io.emit('missionStatus', {
                                status: 'paused',
                                progress: missionState.progress
                            });
                        }
                        break;
                    case 'resume':
                        if (missionState) {
                            missionState.status = 'in-progress';
                            io.emit('missionStatus', {
                                status: 'in-progress',
                                progress: missionState.progress
                            });
                        }
                        break;
                    case 'abort':
                        if (missionState) {
                            missionState.status = 'aborted';
                            activeMissions.delete(missionId);
                            // Set drone status to idle
                            yield Drone_1.default.findByIdAndUpdate(droneId, { status: 'idle' });
                            io.emit('droneStatus', { droneId, status: 'idle' });
                            io.emit('missionStatus', {
                                status: 'aborted',
                                progress: missionState.progress
                            });
                        }
                        break;
                }
            }
            catch (error) {
                console.error('Error handling mission control:', error);
                socket.emit('error', { message: 'Failed to process mission control command' });
            }
        }));
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const startMissionSimulation = (io, missionId, waypoints, droneId) => {
    const missionState = activeMissions.get(missionId);
    if (!missionState)
        return;
    let currentIndex = 0;
    const totalWaypoints = waypoints.length;
    const moveDrone = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!missionState || missionState.status !== 'in-progress')
            return;
        if (currentIndex >= totalWaypoints) {
            // Mission completed
            missionState.status = 'completed';
            activeMissions.delete(missionId);
            // Set drone status to idle
            yield Drone_1.default.findByIdAndUpdate(droneId, { status: 'idle' });
            io.emit('droneStatus', { droneId, status: 'idle' });
            io.emit('missionStatus', {
                status: 'completed',
                progress: 100
            });
            return;
        }
        const currentWaypoint = waypoints[currentIndex];
        missionState.dronePosition = {
            lat: currentWaypoint.lat,
            lng: currentWaypoint.lng,
            altitude: currentWaypoint.altitude
        };
        // Calculate progress
        const progress = Math.round((currentIndex / totalWaypoints) * 100);
        missionState.progress = progress;
        // Emit updates
        io.emit('dronePosition', missionState.dronePosition);
        io.emit('missionStatus', {
            status: 'in-progress',
            progress
        });
        currentIndex++;
        setTimeout(moveDrone, 2000); // Move to next waypoint every 2 seconds
    });
    moveDrone();
};
