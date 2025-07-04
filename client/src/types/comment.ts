import type { User } from "./user";

export interface Comment {
  _id: string;
  ticket_id: string;
  user_id: User;
  comment: string;
  is_internal: boolean;
  created_at: string;
}
