export type UserRole = "client" | "qa" | "admin" | "developer";

export interface User {
  _id: string;
  name: string;
  companyName: string;
  email: string;
  role: UserRole;

  isEmailVerified: boolean;
  emailVerifiedAt?: string;

  isApprovedByAdmin: boolean;
  adminApprovedAt?: string;

  avatar?: {
    url: string;
    public_id: string;
  };

  pendingEmail?: string;
  resetOtp?: string;
  resetOtpExpiresAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

export type UserId = string;
