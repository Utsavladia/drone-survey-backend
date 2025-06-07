import { default as io } from 'socket.io-client';
import mongoose from 'mongoose';
import Mission from './models/Mission';
import Drone from './models/Drone';
import { IWaypoint } from './models/Mission';

interface DronePosition {
  lat: number;
  lng: number;
  altitude: number;
}

interface MissionStatus {
  status: 'planned' | 'in-progress' | 'completed' | 'aborted' | 'paused';
  progress: number;
}

interface SocketError {
  message: string;
}

const SOCKET_URL = 'http://localhost:5000';

async function createTestMission() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/drone-survey');
    console.log('Connected to MongoDB');

    // Create a test drone if it doesn't exist
    let drone = await Drone.findOne({ name: 'Test Drone' });
    if (!drone) {
      drone = await Drone.create({
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
    const mission = await Mission.create({
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
  } catch (error) {
    console.error('Error creating test mission:', error);
    process.exit(1);
  }
}

async function testMissionControl() {
  const socket = io(SOCKET_URL);
  const missionId = await createTestMission();

  socket.on('connect', () => {
    console.log('Connected to socket server');

    // Start the mission
    console.log('Starting mission...');
    socket.emit('missionControl', { action: 'start', missionId });

    // Listen for updates
    socket.on('dronePosition', (position: DronePosition) => {
      console.log('Drone position:', position);
    });

    socket.on('missionStatus', (status: MissionStatus) => {
      console.log('Mission status:', status);
    });

    socket.on('error', (error: SocketError) => {
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

  socket.on('connect_error', (error: Error) => {
    console.error('Connection error:', error);
    process.exit(1);
  });
}

testMissionControl(); 