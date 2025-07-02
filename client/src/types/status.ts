import type { UserRole } from "./user";

export interface Status {
  _id: string;
  name: string;
  role: UserRole;
  order: number;
}
