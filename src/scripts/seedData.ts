import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Drone from '../models/Drone';
import Mission from '../models/Mission';
import SurveyReport from '../models/SurveyReport';

dotenv.config();

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

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drone-survey');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Drone.deleteMany({});
    await Mission.deleteMany({});
    await SurveyReport.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample drones
    const drones = await Drone.insertMany(sampleDrones);
    console.log('Inserted sample drones');

    // Create a sample mission
    const mission = await Mission.create({
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
    await SurveyReport.create({
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
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 