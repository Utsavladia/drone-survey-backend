"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
// Sample drone data
const sampleDrone = {
    name: 'Test Drone 1',
    droneModel: 'DJI Mavic 3',
    status: 'available',
    batteryLevel: 100,
    location: {
        type: 'Point',
        coordinates: [0, 0]
    },
    lastActive: new Date()
};
// Function to simulate battery drain
const simulateBatteryDrain = () => {
    let batteryLevel = 100;
    let status = 'available';
    const interval = setInterval(() => {
        // Decrease battery level
        batteryLevel = Math.max(0, batteryLevel - 5);
        // Update status based on battery level
        if (batteryLevel <= 20) {
            status = 'maintenance';
        }
        else if (batteryLevel <= 0) {
            status = 'charging';
        }
        // Update drone data
        const updatedDrone = Object.assign(Object.assign({}, sampleDrone), { batteryLevel,
            status, lastActive: new Date() });
        // Emit update
        console.log('Emitting drone update:', {
            name: updatedDrone.name,
            batteryLevel: updatedDrone.batteryLevel,
            status: updatedDrone.status
        });
        index_1.socketService.emitDroneUpdate(updatedDrone);
        // Stop when battery is depleted
        if (batteryLevel <= 0) {
            clearInterval(interval);
            console.log('Test completed: Battery depleted');
        }
    }, 2000); // Update every 2 seconds
};
// Start the test
console.log('Starting drone update test...');
simulateBatteryDrain();
