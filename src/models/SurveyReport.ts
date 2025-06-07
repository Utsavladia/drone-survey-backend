import mongoose, { Document, Schema } from 'mongoose';

export interface ISurveyReport extends Document {
  mission: mongoose.Types.ObjectId;
  duration: number;
  distance: number;
  coverage: number;
  summary: string;
  createdAt: Date;
}

const SurveyReportSchema = new Schema<ISurveyReport>({
  mission: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
  duration: { type: Number, required: true },
  distance: { type: Number, required: true },
  coverage: { type: Number, required: true },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISurveyReport>('SurveyReport', SurveyReportSchema); 