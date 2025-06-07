import mongoose, { Document, Schema } from 'mongoose';

export interface IDrone extends Document {
  name: string;
  droneModel: string;
  status: 'available' | 'in-mission' | 'charging' | 'maintenance';
  batteryLevel: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  lastActive: Date;
  currentMission?: mongoose.Types.ObjectId;
}

const DroneSchema = new Schema<IDrone>({
  name: { type: String, required: true },
  droneModel: { type: String, required: true },
  status: { type: String, enum: ['available', 'in-mission', 'charging', 'maintenance'], default: 'available' },
  batteryLevel: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  lastActive: { type: Date, default: Date.now },
  currentMission: { type: Schema.Types.ObjectId, ref: 'Mission' },
});

DroneSchema.index({ location: '2dsphere' });

export default mongoose.model<IDrone>('Drone', DroneSchema); 