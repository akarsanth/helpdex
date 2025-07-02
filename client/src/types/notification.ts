export interface Notification {
  _id: string;
  user_id: string;
  ticket_id: string;
  message: string;
  read: boolean;
  createdAt: string;
}
