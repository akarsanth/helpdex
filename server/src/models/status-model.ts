import mongoose, { Schema, Document } from "mongoose";

// Enum for allowed status names
export type StatusName =
  | "Open"
  | "Acknowledged"
  | "Assigned"
  | "In Progress"
  | "Pending QA"
  | "Resolved"
  | "Closed"
  | "Reopened";

// Interface for Status document
export interface IStatus extends Document {
  name: StatusName;
  description?: string;
}

const allowedStatuses: StatusName[] = [
  "Open",
  "Acknowledged",
  "Assigned",
  "In Progress",
  "Pending QA",
  "Resolved",
  "Closed",
  "Reopened",
];

const statusSchema = new Schema<IStatus>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: allowedStatuses,
    },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IStatus>("Status", statusSchema);
