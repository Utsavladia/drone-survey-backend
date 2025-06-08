import mongoose, { Document, Schema } from 'mongoose';

export interface IMissionSnapshot {
  name: string;
  description: string;
  flightPath: Array<{
    lat: number;
    lng: number;
    altitude: number;
  }>;
  site: string;
  pattern: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
}

export interface IMissionRun extends Document {
  mission_id: mongoose.Types.ObjectId;
  drone_id: mongoose.Types.ObjectId;
  status: 'in_progress' | 'completed' | 'failed';
  started_at: Date;
  completed_at?: Date;
  missionSnapshot: IMissionSnapshot;
}

const MissionRunSchema = new Schema<IMissionRun>({
  mission_id: {
    type: Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  drone_id: {
    type: Schema.Types.ObjectId,
    ref: 'Drone',
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed'],
    default: 'in_progress'
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  completed_at: {
    type: Date
  },
  missionSnapshot: {
    name: { type: String, required: true },
    description: { type: String, required: false },
    flightPath: [{
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      altitude: { type: Number, required: true }
    }],
    site: { type: String, required: true },
    pattern: {
      type: String,
      enum: ['perimeter', 'crosshatch', 'custom'],
      required: true
    },
    parameters: {
      altitude: { type: Number, required: true },
      overlap: { type: Number, required: true },
      frequency: { type: Number, required: true },
      sensors: [{ type: String }]
    }
  }
});

export const MissionRun = mongoose.model<IMissionRun>('MissionRun', MissionRunSchema); 