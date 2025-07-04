import mongoose, { Schema, Document, Types } from "mongoose";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type StatusName =
  | "Open"
  | "Acknowledged"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Reopened";

export interface ITicket extends Document {
  title: string;
  description: string;
  priority: TicketPriority;
  status: StatusName; // String-based status
  category_id: Types.ObjectId;
  created_by: Types.ObjectId;
  assigned_by?: Types.ObjectId;
  assigned_to?: Types.ObjectId;
  verified_by?: Types.ObjectId;

  assigned_at?: Date;
  resolved_at?: Date;
  verified_at?: Date;
  closed_at?: Date;
  reopened_at?: Date;
  deadline?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

const allowedPriorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

const allowedStatuses: StatusName[] = [
  "Open",
  "Acknowledged",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Reopened",
];

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      required: true,
      enum: allowedPriorities,
    },
    status: {
      type: String,
      required: true,
      enum: allowedStatuses,
      default: "Open",
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigned_by: { type: Schema.Types.ObjectId, ref: "User" },
    assigned_to: { type: Schema.Types.ObjectId, ref: "User" },
    verified_by: { type: Schema.Types.ObjectId, ref: "User" },

    assigned_at: { type: Date },
    resolved_at: { type: Date },
    verified_at: { type: Date },
    closed_at: { type: Date },
    reopened_at: { type: Date },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITicket>("Ticket", ticketSchema);
