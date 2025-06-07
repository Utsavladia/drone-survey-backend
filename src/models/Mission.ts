import mongoose, { Document, Schema } from 'mongoose';

export interface IWaypoint {
  lat: number;
  lng: number;
  altitude: number;
}

export interface IMission extends Document {
  name: string;
  site: string;
  drone: mongoose.Types.ObjectId;
  flightPath: IWaypoint[];
  pattern: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
  status: 'planned' | 'in-progress' | 'completed' | 'aborted';
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

const WaypointSchema = new Schema<IWaypoint>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  altitude: { type: Number, required: true },
}, { _id: false });

const MissionSchema = new Schema<IMission>({
  name: { type: String, required: true },
  site: { type: String, required: true },
  drone: { type: Schema.Types.ObjectId, ref: 'Drone', required: true },
  flightPath: { type: [WaypointSchema], required: true },
  pattern: { type: String, enum: ['perimeter', 'crosshatch', 'custom'], required: true },
  parameters: {
    altitude: { type: Number, required: true },
    overlap: { type: Number, required: true },
    frequency: { type: Number, required: true },
    sensors: [{ type: String }],
  },
  status: { type: String, enum: ['planned', 'in-progress', 'completed', 'aborted'], default: 'planned' },
  progress: { type: Number, default: 0 },
  startTime: { type: Date },
  endTime: { type: Date },
});

export default mongoose.model<IMission>('Mission', MissionSchema); 