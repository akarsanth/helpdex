export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
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
