import { Server } from 'socket.io';
import { Request, Response, Router } from 'express';

let simulation: {
  waypoints: { lat: number; lng: number }[];
  currentIdx: number;
  battery: number;
  progress: number;
  status: 'in-progress' | 'paused' | 'aborted' | 'completed';
  timer: NodeJS.Timeout | null;
  position: { lat: number; lng: number };
} = {
  waypoints: [],
  currentIdx: 0,
  battery: 100,
  progress: 0,
  status: 'completed',
  timer: null,
  position: { lat: 0, lng: 0 }
};

let io: Server;

export function setSocketIO(socketIO: Server) {
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
  if (simulation.timer) clearInterval(simulation.timer);
  simulation.status = 'in-progress';
  simulation.currentIdx = 0;
  simulation.battery = 100;
  simulation.progress = 0;
  simulation.position = simulation.waypoints[0];

  simulation.timer = setInterval(() => {
    if (simulation.status !== 'in-progress') return;

    // Move to next waypoint
    if (simulation.currentIdx < simulation.waypoints.length - 1) {
      simulation.currentIdx++;
      simulation.position = simulation.waypoints[simulation.currentIdx];
      simulation.progress = Math.round((simulation.currentIdx / (simulation.waypoints.length - 1)) * 100);
      simulation.battery = Math.max(0, simulation.battery - 0.1);
      emitUpdate();
    } else {
      simulation.status = 'completed';
      emitUpdate();
      clearInterval(simulation.timer!);
    }
  }, 100);
}

export const simulationRouter = Router();

simulationRouter.post('/start-mission', (req: Request, res: Response) => {
  simulation.waypoints = req.body;
  startSimulation();
  res.json({ message: 'Simulation started' });
});

simulationRouter.post('/pause', (req: Request, res: Response) => {
  simulation.status = 'paused';
  res.json({ message: 'Simulation paused' });
});

simulationRouter.post('/resume', (req: Request, res: Response) => {
  simulation.status = 'in-progress';
  res.json({ message: 'Simulation resumed' });
});

simulationRouter.post('/abort', (req: Request, res: Response) => {
  simulation.status = 'aborted';
  if (simulation.timer) clearInterval(simulation.timer);
  simulation = { ...simulation, timer: null, progress: 0, battery: 100, currentIdx: 0, position: { lat: 0, lng: 0 } };
  emitUpdate();
  res.json({ message: 'Simulation aborted' });
}); 