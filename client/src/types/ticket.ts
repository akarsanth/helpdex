import type { Status } from "./status";
import type { Category } from "./category";
import type { User } from "./user";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: Status;
  category: Category;
  created_by: User;
  assigned_by?: User;
  assigned_to?: User;
  verified_by?: User;
  assigned_at?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketLean {
  _id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status_id: string;
  category_id: string;
  created_by: string;
  assigned_by?: string;
  assigned_to?: string;
  verified_by?: string;
  assigned_at?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}
