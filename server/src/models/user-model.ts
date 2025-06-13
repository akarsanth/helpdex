import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

// Define roles
export type UserRole = "client" | "qa" | "admin" | "developer";

// Interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  companyName: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  isApprovedByAdmin: boolean;
  adminApprovedAt?: Date;
  resetOtp?: string;
  resetOtpExpiresAt?: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  toJSON(): Record<string, any>; // to exclude password in responses
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String }, // No validation

    role: {
      type: String,
      enum: ["client", "qa", "admin", "developer"],
      default: "client",
    },

    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: Date,

    isApprovedByAdmin: { type: Boolean, default: false },
    adminApprovedAt: Date,

    resetOtp: String,
    resetOtpExpiresAt: Date,
  },
  { timestamps: true }
);

// Hash password if modified
// userSchema.pre<IUser>("save", async function (next) {
//   if (!this.isModified("password") || !this.password) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Compare passwords
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hide password and __v in JSON response
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
