import type { User, UserId } from "./user";

export interface Comment {
  _id: string;
  content: string;
  createdBy: User;
  ticket_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentLean extends Omit<Comment, "createdBy"> {
  createdBy: UserId;
}
