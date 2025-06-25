import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  ticket_id: Types.ObjectId;
  user_id: Types.ObjectId;
  message: string;
  is_read: boolean;
  sent_at: Date;
}

const notificationSchema = new Schema<INotification>({
  ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  sent_at: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>("Notification", notificationSchema);
