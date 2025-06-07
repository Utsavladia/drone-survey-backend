import mongoose, { Document, Schema } from 'mongoose';

export interface IWaypoint {
  lat: number;
  lng: number;
  altitude: number;
}

export interface IDrone {
  id: string;
  name: string;
  battery: number;
  currentPosition: {
    lat: number;
    lng: number;
  };
  currentWaypointIndex: number;
}

export interface IMission extends Document {
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
  assignedDrone: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const missionSchema = new Schema<IMission>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'aborted'],
    default: 'planned'
  },
  flightPath: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    altitude: { type: Number, required: true }
  }],
  site: { type: String, required: true },
  pattern: {
    type: String,
    enum: ['perimeter', 'crosshatch', 'custom'],
    default: 'perimeter'
  },
  parameters: {
    altitude: { type: Number, required: true },
    overlap: { type: Number, required: true },
    frequency: { type: Number, required: true },
    sensors: [{ type: String }]
  },
  assignedDrone: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', required: true }
}, {
  timestamps: true
});

export default mongoose.model<IMission>('Mission', missionSchema); 