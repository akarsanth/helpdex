export type UserRole = "client" | "qa" | "admin" | "developer";

export interface User {
  _id: string;
  name: string;
  companyName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isApprovedByAdmin: boolean;
  emailVerifiedAt?: string;
  adminApprovedAt?: string;
}

export type UserId = string;
