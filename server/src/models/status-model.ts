import mongoose, { Schema, Document } from "mongoose";

export interface IStatus extends Document {
  name: string;
}

const statusSchema = new Schema<IStatus>({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model<IStatus>("Status", statusSchema);
