"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationRouter = void 0;
exports.setSocketIO = setSocketIO;
const express_1 = require("express");
let simulation = {
    waypoints: [],
    currentIdx: 0,
    battery: 100,
    progress: 0,
    status: 'completed',
    timer: null,
    position: { lat: 0, lng: 0 }
};
let io;
function setSocketIO(socketIO) {
    io = socketIO;
}
function emitUpdate() {
    if (io) {
        io.emit('drone-update', {
            position: simulation.position,
            battery: simulation.battery,
            progress: simulation.progress,
            status: simulation.status
        });
    }
}
function startSimulation() {
    if (simulation.timer)
        clearInterval(simulation.timer);
    simulation.status = 'in-progress';
    simulation.currentIdx = 0;
    simulation.battery = 100;
    simulation.progress = 0;
    simulation.position = simulation.waypoints[0];
    simulation.timer = setInterval(() => {
        if (simulation.status !== 'in-progress')
            return;
        // Move to next waypoint
        if (simulation.currentIdx < simulation.waypoints.length - 1) {
            simulation.currentIdx++;
            simulation.position = simulation.waypoints[simulation.currentIdx];
            simulation.progress = Math.round((simulation.currentIdx / (simulation.waypoints.length - 1)) * 100);
            simulation.battery = Math.max(0, simulation.battery - 0.1);
            emitUpdate();
        }
        else {
            simulation.status = 'completed';
            emitUpdate();
            clearInterval(simulation.timer);
        }
    }, 100);
}
exports.simulationRouter = (0, express_1.Router)();
exports.simulationRouter.post('/start-mission', (req, res) => {
    simulation.waypoints = req.body;
    startSimulation();
    res.json({ message: 'Simulation started' });
});
exports.simulationRouter.post('/pause', (req, res) => {
    simulation.status = 'paused';
    res.json({ message: 'Simulation paused' });
});
exports.simulationRouter.post('/resume', (req, res) => {
    simulation.status = 'in-progress';
    res.json({ message: 'Simulation resumed' });
});
exports.simulationRouter.post('/abort', (req, res) => {
    simulation.status = 'aborted';
    if (simulation.timer)
        clearInterval(simulation.timer);
    simulation = Object.assign(Object.assign({}, simulation), { timer: null, progress: 0, battery: 100, currentIdx: 0, position: { lat: 0, lng: 0 } });
    emitUpdate();
    res.json({ message: 'Simulation aborted' });
});
