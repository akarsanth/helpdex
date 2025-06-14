import asyncHandler from "express-async-handler";
import User from "../models/user-model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import sendEmail from "../utils/sendEmail";
import config from "../config";

// Define expected request body for user registration
interface RegisterRequestBody {
  name: string;
  companyName: string;
  email: string;
  password: string;
}

// @desc    Register a new user
// @route   POST /api/v1/users
// @access  Public
const register = asyncHandler(
  async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    const { name, companyName, email, password } = req.body;

    // Validate required fields
    if (!name || !companyName || !email || !password) {
      res.status(400);
      throw new Error("All fields are required.");
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists.");
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const user = await User.create({
      name,
      email,
      companyName,
      password: hashedPassword,
    });

    if (user) {
      // Generate activation token
      const activationToken = createActivationToken({
        _id: user._id.toString(),
        email: user.email,
      });

      // Construct email verification URL
      const activationUrl = `${config.domain}/activate/${activationToken}`;

      // Send email verification link
      await sendEmail(email, activationUrl, "Verify your account");

      // Respond with success message
      res.status(201).json({
        message: `Registration successful. Please check your email "${email}" to activate your account.`,
      });
    } else {
      res.status(400);
      throw new Error("Failed to create user.");
    }
  }
);

// @desc    Verify user's email using activation token
// @route   POST /api/v1/users/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { activationToken } = req.body;

    // Check if token is provided and is valid string
    if (!activationToken || typeof activationToken !== "string") {
      res.status(400);
      throw new Error("Activation token is missing or invalid!");
    }

    // Decode and verify token
    const decoded = jwt.verify(
      activationToken,
      process.env.ACTIVATION_TOKEN_SECRET as string
    ) as { _id: string; email: string };

    // Find user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(400);
      throw new Error("User not found!");
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.status(400).json({ message: "Email already verified!" });
      return;
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || "Invalid or expired activation token.");
  }
});

// @desc    Approve a user manually by admin
// @route   PUT /api/v1/users/:id/approve
// @access  Private (Admin only)
export const approveUser = asyncHandler(async (req: Request, res: Response) => {
  // Find user by ID
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Mark user as approved
  user.isApprovedByAdmin = true;
  user.adminApprovedAt = new Date();
  await user.save();

  res.status(200).json({ message: "User approved successfully" });
});

// @desc    Resend email verification link to unverified user
// @route   POST /api/v1/users/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if already verified
  if (user.isEmailVerified) {
    res.status(400);
    throw new Error("Email already verified");
  }

  // Generate and send activation token again
  const token = createActivationToken({ _id: user._id.toString(), email });
  const activationUrl = `${config.domain}/activate/${token}`;
  await sendEmail(email, activationUrl, "Verify your account");

  res.status(200).json({ message: "Activation email resent." });
});

// Helper function to generate activation token (valid for 30 minutes)
const createActivationToken = (user: { _id: string; email: string }) => {
  return jwt.sign(user, process.env.ACTIVATION_TOKEN_SECRET as string, {
    expiresIn: "30m",
  });
};

// Export controllers
export { register, verifyEmail, resendVerification };
