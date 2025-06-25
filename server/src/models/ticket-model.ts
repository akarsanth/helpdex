import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITicket extends Document {
  title: string;
  description: string;
  priority: string;
  status_id: Types.ObjectId;
  category_id: Types.ObjectId;
  created_by: Types.ObjectId;
  assigned_by?: Types.ObjectId;
  assigned_to?: Types.ObjectId;
  verified_by?: Types.ObjectId;
  assigned_at?: Date;
  deadline?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, required: true },
    status_id: { type: Schema.Types.ObjectId, ref: "Status", required: true },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assigned_by: { type: Schema.Types.ObjectId, ref: "User" },
    assigned_to: { type: Schema.Types.ObjectId, ref: "User" },
    verified_by: { type: Schema.Types.ObjectId, ref: "User" },
    assigned_at: { type: Date },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITicket>("Ticket", ticketSchema);
