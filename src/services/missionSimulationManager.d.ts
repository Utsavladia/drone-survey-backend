interface Waypoint {
  lat: number;
  lng: number;
}

interface SimulationState {
  waypoints: Waypoint[];
  currentIndex: number;
  status: 'running' | 'completed' | 'aborted';
  startedAt: number;
  progress: number;
  currentPosition: Waypoint;
  intervalId: NodeJS.Timeout | null;
}

declare const activeSimulations: Map<string, SimulationState>;

declare function startSimulation(missionRunId: string, waypoints: Waypoint[]): SimulationState;
declare function stopSimulation(missionRunId: string): void;

export { activeSimulations, startSimulation, stopSimulation, SimulationState, Waypoint }; 