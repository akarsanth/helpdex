import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define allowed user roles
export type UserRole = "client" | "qa" | "admin" | "developer";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  companyName: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  isApprovedByAdmin: boolean;
  adminApprovedAt?: Date;
  resetOtp?: string;
  resetOtpExpiresAt?: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["client", "qa", "admin", "developer"],
      required: true,
      default: "client",
    },

    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },

    isApprovedByAdmin: { type: Boolean, default: false },
    adminApprovedAt: { type: Date },

    resetOtp: { type: String },
    resetOtpExpiresAt: { type: Date },
  },
  { timestamps: true }
);

// Match password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  console.log(await bcrypt.compare(enteredPassword, this.password));
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
