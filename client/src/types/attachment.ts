import type { UserId } from "./user";

export interface Attachment {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: UserId;
  ticket_id: string;
  createdAt: string;
}
