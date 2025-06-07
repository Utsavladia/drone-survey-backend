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
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const mongoose_1 = __importDefault(require("mongoose"));
const Mission_1 = __importDefault(require("./models/Mission"));
const Drone_1 = __importDefault(require("./models/Drone"));
const SOCKET_URL = 'http://localhost:5000';
function createTestMission() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect('mongodb://localhost:27017/drone-survey');
            console.log('Connected to MongoDB');
            // Create a test drone if it doesn't exist
            let drone = yield Drone_1.default.findOne({ name: 'Test Drone' });
            if (!drone) {
                drone = yield Drone_1.default.create({
                    name: 'Test Drone',
                    model: 'Test Model',
                    status: 'idle',
                    batteryLevel: 100,
                    currentLocation: {
                        lat: 37.7749,
                        lng: -122.4194,
                        altitude: 0
                    }
                });
            }
            // Create a test mission
            const mission = yield Mission_1.default.create({
                name: 'Test Mission',
                description: 'A test mission for socket testing',
                status: 'planned',
                assignedDrone: drone._id,
                flightPath: [
                    { lat: 37.7749, lng: -122.4194, altitude: 100 },
                    { lat: 37.7750, lng: -122.4195, altitude: 100 },
                    { lat: 37.7751, lng: -122.4196, altitude: 100 },
                    { lat: 37.7752, lng: -122.4197, altitude: 100 }
                ],
                site: 'Test Site'
            });
            console.log('Created test mission:', mission._id);
            return mission._id;
        }
        catch (error) {
            console.error('Error creating test mission:', error);
            process.exit(1);
        }
    });
}
function testMissionControl() {
    return __awaiter(this, void 0, void 0, function* () {
        const socket = (0, socket_io_client_1.default)(SOCKET_URL);
        const missionId = yield createTestMission();
        socket.on('connect', () => {
            console.log('Connected to socket server');
            // Start the mission
            console.log('Starting mission...');
            socket.emit('missionControl', { action: 'start', missionId });
            // Listen for updates
            socket.on('dronePosition', (position) => {
                console.log('Drone position:', position);
            });
            socket.on('missionStatus', (status) => {
                console.log('Mission status:', status);
            });
            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
            // Simulate mission control actions
            setTimeout(() => {
                console.log('Pausing mission...');
                socket.emit('missionControl', { action: 'pause', missionId });
            }, 5000);
            setTimeout(() => {
                console.log('Resuming mission...');
                socket.emit('missionControl', { action: 'resume', missionId });
            }, 10000);
            setTimeout(() => {
                console.log('Aborting mission...');
                socket.emit('missionControl', { action: 'abort', missionId });
                socket.disconnect();
                process.exit(0);
            }, 15000);
        });
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            process.exit(1);
        });
    });
}
testMissionControl();
