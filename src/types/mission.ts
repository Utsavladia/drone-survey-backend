export interface IWaypoint {
  lat: number;
  lng: number;
  altitude: number;
  heading?: number;
  speed?: number;
}

export interface IMission {
  _id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'aborted';
  flightPath: IWaypoint[];
  site: string;
  pattern: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
  assignedDrone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMissionInput {
  name: string;
  description: string;
  flightPath: IWaypoint[];
  site: string;
  pattern?: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
  assignedDrone: string;
} 