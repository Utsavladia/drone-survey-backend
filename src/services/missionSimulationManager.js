// Map to track active mission simulations
const activeSimulations = new Map();
const { MissionRun } = require('../models/MissionRun');

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

/**
 * Update mission run status in database
 * @param {string} missionRunId - ID of the mission run
 * @param {string} status - New status ('completed' or 'failed')
 */
async function updateMissionRunStatus(missionRunId, status) {
    try {
        await MissionRun.findByIdAndUpdate(missionRunId, {
            status,
            completed_at: new Date()
        });
        console.log(`Mission run ${missionRunId} status updated to ${status}`);
    } catch (error) {
        console.error(`Error updating mission run ${missionRunId} status:`, error);
    }
}

/**
 * Start a mission simulation
 * @param {string} missionRunId - Unique identifier for the mission run
 * @param {Array<{lat: number, lng: number}>} waypoints - Array of waypoints to simulate
 * @returns {Object} The simulation state object
 */
function startSimulation(missionRunId, waypoints) {
    // Handle edge cases
    if (!waypoints || waypoints.length === 0) {
        throw new Error('No waypoints provided for simulation');
    }

    if (activeSimulations.has(missionRunId)) {
        throw new Error('Simulation already exists for this mission run');
    }

    // Initialize simulation state
    const simulationState = {
        waypoints,
        currentIndex: 0,
        status: 'running',
        startedAt: Date.now(),
        progress: 0,
        currentPosition: { ...waypoints[0] },
        intervalId: null,
        batteryLevel: 100, // Initial battery level in percentage
        batteryDrainRate: 0.02 // Battery drain per second in percentage
    };

    // Add to active simulations
    activeSimulations.set(missionRunId, simulationState);

    // Start simulation interval
    simulationState.intervalId = setInterval(() => {
        const state = activeSimulations.get(missionRunId);
        if (!state || state.status !== 'running') {
            return;
        }

        // Update battery level
        state.batteryLevel = Math.max(0, state.batteryLevel - state.batteryDrainRate);

        // Check if battery is depleted
        if (state.batteryLevel <= 0) {
            state.status = 'failed';
            state.progress = Math.round((state.currentIndex / (waypoints.length - 1)) * 100);
            clearInterval(state.intervalId);
            
            // Update mission run status in database
            updateMissionRunStatus(missionRunId, 'failed');
            return;
        }

        // If we've reached the last waypoint
        if (state.currentIndex >= waypoints.length - 1) {
            state.status = 'completed';
            state.progress = 100;
            state.currentPosition = { ...waypoints[waypoints.length - 1] };
            clearInterval(state.intervalId);
            
            // Update mission run status in database
            updateMissionRunStatus(missionRunId, 'completed');
            return;
        }

        // Calculate movement to next waypoint
        const currentWaypoint = waypoints[state.currentIndex];
        const nextWaypoint = waypoints[state.currentIndex + 1];
        
        // Move 1% of the distance to next waypoint each second
        const distance = calculateDistance(
            currentWaypoint.lat,
            currentWaypoint.lng,
            nextWaypoint.lat,
            nextWaypoint.lng
        );
        
        const stepSize = distance * 0.01; // 1% of total distance
        
        // Update position
        const latDiff = nextWaypoint.lat - currentWaypoint.lat;
        const lngDiff = nextWaypoint.lng - currentWaypoint.lng;
        
        state.currentPosition.lat += latDiff * 0.01;
        state.currentPosition.lng += lngDiff * 0.01;

        // Check if we've reached the next waypoint
        const distanceToNext = calculateDistance(
            state.currentPosition.lat,
            state.currentPosition.lng,
            nextWaypoint.lat,
            nextWaypoint.lng
        );

        if (distanceToNext < stepSize) {
            state.currentIndex++;
            state.currentPosition = { ...nextWaypoint };
        }

        // Update progress
        state.progress = Math.round((state.currentIndex / (waypoints.length - 1)) * 100);
    }, 1000);

    return simulationState;
}

/**
 * Stop a running simulation
 * @param {string} missionRunId - ID of the mission to stop
 */
async function stopSimulation(missionRunId) {
    const state = activeSimulations.get(missionRunId);
    if (state && state.intervalId) {
        clearInterval(state.intervalId);
        state.status = 'aborted';
        // Update mission run status in database
        await updateMissionRunStatus(missionRunId, 'failed');
    }
}

module.exports = {
    activeSimulations,
    startSimulation,
    stopSimulation
}; 