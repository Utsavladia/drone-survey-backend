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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Drone_1 = __importDefault(require("../models/Drone"));
const Mission_1 = __importDefault(require("../models/Mission"));
const SurveyReport_1 = __importDefault(require("../models/SurveyReport"));
dotenv_1.default.config();
const sampleDrones = [
    {
        name: 'Drone Alpha',
        droneModel: 'DJI Mavic 3',
        status: 'available',
        batteryLevel: 85,
        location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
        },
        lastActive: new Date(),
    },
    {
        name: 'Drone Beta',
        droneModel: 'DJI Phantom 4',
        status: 'in-mission',
        batteryLevel: 45,
        location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
        },
        lastActive: new Date(),
    },
    {
        name: 'Drone Gamma',
        droneModel: 'DJI Mini 3',
        status: 'maintenance',
        batteryLevel: 20,
        location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
        },
        lastActive: new Date(),
    },
];
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drone-survey');
        console.log('Connected to MongoDB');
        // Clear existing data
        yield Drone_1.default.deleteMany({});
        yield Mission_1.default.deleteMany({});
        yield SurveyReport_1.default.deleteMany({});
        console.log('Cleared existing data');
        // Insert sample drones
        const drones = yield Drone_1.default.insertMany(sampleDrones);
        console.log('Inserted sample drones');
        // Create a sample mission
        const mission = yield Mission_1.default.create({
            name: 'Test Mission',
            site: 'San Francisco',
            drone: drones[0]._id,
            flightPath: [
                { lat: 37.7749, lng: -122.4194, altitude: 100 },
                { lat: 37.7848, lng: -122.4294, altitude: 100 },
            ],
            pattern: 'perimeter',
            parameters: {
                altitude: 100,
                overlap: 75,
                frequency: 1,
                sensors: ['RGB', 'NDVI'],
            },
            status: 'completed',
            progress: 100,
            startTime: new Date(Date.now() - 3600000),
            endTime: new Date(),
        });
        console.log('Created sample mission');
        // Create a sample report
        yield SurveyReport_1.default.create({
            mission: mission._id,
            duration: 3600,
            distance: 5.2,
            coverage: 2.5,
            summary: 'Test survey completed successfully',
            createdAt: new Date(),
        });
        console.log('Created sample report');
        console.log('Database seeded successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
});
seedDatabase();
