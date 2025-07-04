// types/ticket.ts

import type { StatusName } from "../utils/status-transition";
import type { Category } from "./category";
import type { User } from "./user";

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
  verified_by?: User;

  assigned_at?: string;
  resolved_at?: string;
  verified_at?: string;
  closed_at?: string;
  reopened_at?: string;
  deadline?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * TicketLean: used when sending or receiving raw Mongo IDs
 */
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
  resolved_at?: string;
  verified_at?: string;
  closed_at?: string;
  reopened_at?: string;
  deadline?: string;

  createdAt: string;
  updatedAt: string;
}
