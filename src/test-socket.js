const socketService = require('./services/socketService');
const Drone = require('./models/Drone');

// Sample drone data
const testDrone = {
  name: 'Test Drone',
  model: 'DJI Mavic',
  status: 'available',
  batteryLevel: 100,
  location: {
    latitude: 37.7749,
    longitude: -122.4194
  }
};

// Function to simulate battery drain
function simulateBatteryDrain() {
  testDrone.batteryLevel = Math.max(0, testDrone.batteryLevel - 5);
  console.log(`Emitting drone update - Battery: ${testDrone.batteryLevel}%`);
  socketService.emitDroneUpdate(testDrone);
}

// Function to simulate status change
function simulateStatusChange() {
  const statuses = ['available', 'in-mission', 'charging', 'maintenance'];
  const currentIndex = statuses.indexOf(testDrone.status);
  const nextIndex = (currentIndex + 1) % statuses.length;
  testDrone.status = statuses[nextIndex];
  console.log(`Emitting drone update - Status: ${testDrone.status}`);
  socketService.emitDroneUpdate(testDrone);
}

// Start the test
console.log('Starting socket test...');
console.log('Press Ctrl+C to stop');

// Emit updates every 5 seconds
setInterval(() => {
  simulateBatteryDrain();
  simulateStatusChange();
}, 5000); 