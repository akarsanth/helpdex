import type { StatusName } from "../utils/status-transition";
import type { Category } from "./category";
import type { User } from "./user";
import type { Comment } from "./comment";
import type { Attachment } from "./attachment"; // ✅ Add this

export type TicketPriority = "low" | "medium" | "high" | "urgent";

/**
 * Ticket type with populated references (used for display)
 */
export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: TicketPriority;

  status: StatusName;
  category: Category;
  created_by: User;

  assigned_by?: User;
  assigned_to?: User;
  closed_by?: User;

  assigned_at?: string;
  resolved_at?: string;
  closed_at?: string;
  reopened_at?: string;
  deadline?: string;

  createdAt: string;
  updatedAt: string;

  comments: Comment[];
  attachments: Attachment[]; // ✅ New field added
}
