import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  ticket_id: Types.ObjectId;
  user_id: Types.ObjectId;
  comment: string;
  is_internal: boolean;
  created_at?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    is_internal: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export default mongoose.model<IComment>("Comment", commentSchema);
