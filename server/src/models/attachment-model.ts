import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttachment extends Document {
  ticket_id: Types.ObjectId;
  filename: string;
  original_name: string;
  path: string;
  mime_type: string;
  size: number;
  uploaded_at: Date;
}

const attachmentSchema = new Schema<IAttachment>({
  ticket_id: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
  filename: { type: String, required: true },
  original_name: { type: String, required: true },
  path: { type: String, required: true },
  mime_type: { type: String, required: true },
  size: { type: Number, required: true },
  uploaded_at: { type: Date, default: Date.now },
});

export default mongoose.model<IAttachment>("Attachment", attachmentSchema);
