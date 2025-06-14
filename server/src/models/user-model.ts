import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

// Define allowed roles for the user
export type UserRole = "client" | "qa" | "admin" | "developer";

// Interface describing the User document structure
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

  // Method to compare passwords
  matchPassword(enteredPassword: string): Promise<boolean>;

  // Method to remove sensitive fields from the response
  toJSON(): Record<string, any>;
}

// Define schema for the User collection
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
    password: { type: String }, // Password is stored hashed, validation handled elsewhere

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
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Method to compare hashed password with entered password
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Override toJSON to hide sensitive fields like password and __v
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Create and export the User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
