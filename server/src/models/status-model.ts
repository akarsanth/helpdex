import mongoose, { Schema, Document } from "mongoose";

// Interface for Status document
export interface IStatus extends Document {
  name: string;
  description?: string;
}

const statusSchema = new Schema<IStatus>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
});

export default mongoose.model<IStatus>("Status", statusSchema);
