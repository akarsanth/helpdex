import asyncHandler from "express-async-handler";
import User from "../models/user-model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import sendEmail from "../utils/send-email";
import config from "../config";
import {
  createAccessToken,
  createActivationToken,
  createRefreshToken,
} from "../utils/token";
import { generateOtp } from "../utils/generate-otp";

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
export const register = asyncHandler(
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
      await sendEmail({
        to: email,
        subject: "Verify your HelpDex account",
        heading: "Welcome to HelpDex",
        message:
          "Thanks for registering! Please click the button below to verify your email and activate your account.",
        buttonText: "Verify Account",
        buttonUrl: activationUrl,
      });

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
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
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

// @desc    Login User
// @route   POST /api/v1/users/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check for email and password
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    const activationToken = createActivationToken({
      _id: user._id.toString(),
      email: user.email,
    });

    const activationUrl = `${config.domain}/activate/${activationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your HelpDex account",
      heading: "Email Verification Needed",
      message: "You must verify your email to log in. Click below to verify.",
      buttonText: "Verify Now",
      buttonUrl: activationUrl,
    });

    res.status(403).json({
      message: "Email not verified. A verification email has been resent.",
    });
    return;
  }

  // Optional: Check if admin has approved
  if (!user.isApprovedByAdmin) {
    res.status(403);
    throw new Error("Your account is pending admin approval.");
  }

  // Creating refresh token
  const refreshToken = createRefreshToken({ _id: user._id });

  console.log("Setting refresh token cookie");

  // Setting refresh token in the cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // false for Postman/local testing
    sameSite: "lax", // important for cookies to show up
    path: "/api/v1/users/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Respond only with success
  res.status(200).json({ message: "Login successful." });
});

export const getAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401);
      throw new Error("Please login first!");
    }

    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
        _id: string;
      };

      // Get user from DB
      const user = await User.findById(decoded._id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User not found.");
      }

      if (!user.isEmailVerified || !user.isApprovedByAdmin) {
        res.status(403);
        throw new Error("Account not verified or approved.");
      }

      // Create access token
      const accessToken = createAccessToken({ _id: user._id });

      // Send access token and user info
      res.status(200).json({
        accessToken,
        user: user.toJSON(),
      });
    } catch (error) {
      res.status(401);
      throw new Error("Invalid or expired refresh token.");
    }
  }
);

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

  // Unverfied email user cannot be verfied by admin
  if (!user.isEmailVerified) {
    res.status(400);
    throw new Error("Cannot approve user. Email is not verified.");
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
export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (user.isEmailVerified) {
      res.status(400);
      throw new Error("Email is already verified.");
    }

    const token = createActivationToken({
      _id: user._id.toString(),
      email: user.email,
    });

    const activationUrl = `${config.domain}/activate/${token}`;

    await sendEmail({
      to: email,
      subject: "Resend: Verify your HelpDex account",
      heading: "Email Verification Needed",
      message:
        "Click the button below to verify your account and start using HelpDex.",
      buttonText: "Verify Account",
      buttonUrl: activationUrl,
    });

    res.status(200).json({ message: "Verification email has been resent." });
  }
);

// @desc    Send OTP to user email for password reset
// @route   POST /api/v1/users/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("No user found with that email.");
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiresAt = expiresAt;
    await user.save();

    await sendEmail({
      to: email,
      subject: "HelpDex Password Reset OTP",
      heading: "Reset Your Password",
      message:
        "Use the OTP below to reset your password. It's valid for 10 minutes.",
      otp: otp,
    });

    res.status(200).json({ message: "OTP sent to your email." });
  }
);

// @desc    Reset user password using OTP
// @route   POST /api/v1/users/reset-password
// @access  Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== otp ||
      !user.resetOtpExpiresAt ||
      user.resetOtpExpiresAt < new Date()
    ) {
      res.status(400);
      throw new Error("Invalid or expired OTP.");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiresAt = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  }
);
