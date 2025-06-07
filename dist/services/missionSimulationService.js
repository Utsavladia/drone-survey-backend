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
const Mission_1 = __importDefault(require("../models/Mission"));
const Drone_1 = __importDefault(require("../models/Drone"));
class MissionSimulationService {
    constructor(io) {
        this.activeMissions = new Map();
        this.io = io;
    }
    interpolatePosition(start, end, progress) {
        return {
            lat: start.lat + (end.lat - start.lat) * progress,
            lng: start.lng + (end.lng - start.lng) * progress,
            altitude: start.altitude + (end.altitude - start.altitude) * progress
        };
    }
    updateMissionState(missionId, missionState, waypoints) {
        return __awaiter(this, void 0, void 0, function* () {
            if (missionState.currentWaypointIndex >= waypoints.length - 1) {
                // Mission completed
                missionState.status = 'completed';
                this.activeMissions.delete(missionId);
                const mission = yield Mission_1.default.findById(missionId);
                if (mission) {
                    yield Drone_1.default.findByIdAndUpdate(mission.assignedDrone, { status: 'available' });
                    this.io.emit('mission:update', {
                        missionId,
                        status: 'completed',
                        progress: 100,
                        position: waypoints[waypoints.length - 1],
                        battery: missionState.battery
                    });
                }
                return;
            }
            const currentWaypoint = waypoints[missionState.currentWaypointIndex];
            const nextWaypoint = waypoints[missionState.currentWaypointIndex + 1];
            // Calculate progress between waypoints (0 to 1)
            const waypointProgress = (missionState.progress % 100) / 100;
            // Interpolate position
            const position = this.interpolatePosition(currentWaypoint, nextWaypoint, waypointProgress);
            // Update mission state
            missionState.dronePosition = position;
            missionState.progress += 0.1; // Increment progress by 0.1% each update
            missionState.battery = Math.max(0, missionState.battery - 0.01); // Decrease battery by 0.01% each update
            // Emit update
            this.io.emit('mission:update', {
                missionId,
                status: missionState.status,
                progress: Math.min(100, Math.floor(missionState.progress)),
                position,
                battery: missionState.battery
            });
            // Move to next waypoint if progress is complete
            if (missionState.progress >= (missionState.currentWaypointIndex + 1) * 100) {
                missionState.currentWaypointIndex++;
            }
        });
    }
    startMission(missionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const mission = yield Mission_1.default.findById(missionId);
            if (!mission)
                throw new Error('Mission not found');
            // Update drone status to in-mission
            yield Drone_1.default.findByIdAndUpdate(mission.assignedDrone, { status: 'in-mission' });
            const missionState = {
                currentWaypointIndex: 0,
                progress: 0,
                status: 'in-progress',
                dronePosition: null,
                battery: 100,
                timer: null
            };
            this.activeMissions.set(missionId, missionState);
            // Start simulation loop
            const simulationLoop = () => __awaiter(this, void 0, void 0, function* () {
                const currentState = this.activeMissions.get(missionId);
                if (!currentState || currentState.status !== 'in-progress')
                    return;
                yield this.updateMissionState(missionId, currentState, mission.flightPath);
                currentState.timer = setTimeout(simulationLoop, 100); // Update every 100ms
            });
            simulationLoop();
        });
    }
    pauseMission(missionId) {
        const missionState = this.activeMissions.get(missionId);
        if (missionState) {
            missionState.status = 'paused';
            if (missionState.timer) {
                clearTimeout(missionState.timer);
                missionState.timer = null;
            }
            this.io.emit('mission:update', {
                missionId,
                status: 'paused',
                progress: Math.floor(missionState.progress),
                position: missionState.dronePosition,
                battery: missionState.battery
            });
        }
    }
    resumeMission(missionId) {
        const missionState = this.activeMissions.get(missionId);
        if (missionState) {
            missionState.status = 'in-progress';
            this.startMission(missionId);
        }
    }
    abortMission(missionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionState = this.activeMissions.get(missionId);
            if (missionState) {
                missionState.status = 'aborted';
                if (missionState.timer) {
                    clearTimeout(missionState.timer);
                }
                this.activeMissions.delete(missionId);
                const mission = yield Mission_1.default.findById(missionId);
                if (mission) {
                    yield Drone_1.default.findByIdAndUpdate(mission.assignedDrone, { status: 'available' });
                }
                this.io.emit('mission:update', {
                    missionId,
                    status: 'aborted',
                    progress: Math.floor(missionState.progress),
                    position: missionState.dronePosition,
                    battery: missionState.battery
                });
            }
        });
    }
}
exports.default = MissionSimulationService;
