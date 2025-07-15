import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { IncomingForm } from "formidable";
import User from "../models/user-model";
import type { IUser } from "../models/user-model";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  fileToBuffer,
} from "../utils/cloudinary-upload";
import type { File } from "formidable";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import { generateOtp } from "../utils/generate-otp";
import sendEmail from "../utils/send-email";
import {
  createAccessToken,
  createActivationToken,
  createRefreshToken,
} from "../utils/token";

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
// (Lines 26-28 removed as they are duplicates of lines 23-25)
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
      if (!userExists.isEmailVerified) {
        // Send activation token again
        const activationToken = createActivationToken({
          _id: userExists._id.toString(),
          email: userExists.email,
        });

        const activationUrl = `${config.domain}/activate?token=${activationToken}`;

        await sendEmail({
          to: userExists.email,
          subject: "Verify your HelpDex account",
          heading: "Email Verification Reminder",
          message:
            "You previously registered but didn’t verify your email. Click the button below to verify your account.",
          buttonText: "Verify Now",
          buttonUrl: activationUrl,
        });

        res.status(409).json({
          message: `User with email '${userExists.email}' already exists but is not verified.`,
          unverifiedEmail: userExists.email,
        });
        return;
      }

      res.status(400);
      throw new Error("User already exists.");
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      companyName,
      password: hashedPassword,
    });

    if (user) {
      const activationToken = createActivationToken({
        _id: user._id.toString(),
        email: user.email,
      });

      const activationUrl = `${config.domain}/activate?token=${activationToken}`;

      await sendEmail({
        to: email,
        subject: "Verify your HelpDex account",
        heading: "Welcome to HelpDex",
        message:
          "Thanks for registering! Please click the button below to verify your email and activate your account.",
        buttonText: "Verify Account",
        buttonUrl: activationUrl,
      });

      res.status(201).json({
        message: `Registration successful. Please check your email "${email}" to activate your account.`,
      });
    } else {
      res.status(400);
      throw new Error("Failed to create user.");
    }
  }
);

// @desc    Verify user's email or new email (update flow)
// @route   POST /api/v1/users/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { activationToken } = req.body;

  if (!activationToken || typeof activationToken !== "string") {
    res.status(400);
    throw new Error("Activation token is missing or invalid!");
  }

  const decoded = jwt.verify(
    activationToken,
    process.env.ACTIVATION_TOKEN_SECRET as string
  ) as { _id: string; email: string };

  const user = await User.findById(decoded._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.email === decoded.email) {
    // Initial verification flow
    if (user.isEmailVerified) {
      res.status(400);
      throw new Error(`Email '${user.email}' is already verified.`);
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
  } else if (user.pendingEmail === decoded.email) {
    // Email update flow
    const emailExists = await User.findOne({ email: user.pendingEmail });
    if (emailExists) {
      res.status(409);
      throw new Error(`Email '${user.pendingEmail}' is already taken.`);
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
  } else {
    res.status(400);
    throw new Error("Token does not match any valid current/pending email.");
  }

  await user.save();

  res
    .status(200)
    .json({ message: `Email '${user.email}' verified successfully.` });
});

// @desc    Login User
// @route   POST /api/v1/users/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate email and password presence
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  // Look up user by email
  const user = await User.findOne({ email });

  // If user not found or password doesn't match
  if (!user || !(await user.matchPassword(password))) {
    res.status(400);
    throw new Error("Invalid email or password.");
  }

  // If user's email is not verified, block login and send a new activation email
  if (!user.isEmailVerified) {
    const activationToken = createActivationToken({
      _id: user._id.toString(),
      email: user.email,
    });

    const activationUrl = `${config.domain}/activate?token=${activationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your HelpDex account",
      heading: "Email Verification Needed",
      message: "You must verify your email to log in. Click below to verify.",
      buttonText: "Verify Now",
      buttonUrl: activationUrl,
    });

    // Respond with 403 and include unverifiedEmail for frontend resend flow
    res.status(403).json({
      message: "Email not verified. A verification email has been resent.",
      unverifiedEmail: email,
    });
    return;
  }

  // Optional: block login until admin approves user
  if (!user.isApprovedByAdmin) {
    res.status(403);
    throw new Error("Your account is pending admin approval.");
  }

  // Generate refresh token for session handling
  const refreshToken = createRefreshToken({ _id: user._id });

  // Store refresh token in secure HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax",
    path: "/api/v1/users/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Respond with success message
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

    const user = await User.findOne({
      $or: [{ email }, { pendingEmail: email }],
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    // Determine target: unverified primary email OR pending email
    let targetEmail = "";
    if (!user.isEmailVerified && user.email === email) {
      targetEmail = user.email;
    } else if (user.isEmailVerified && user.pendingEmail === email) {
      if (!user.pendingEmail) {
        res.status(400);
        throw new Error("Pending email is missing.");
      }
      targetEmail = user.pendingEmail;
    } else {
      res.status(400);
      throw new Error("Email is already verified or invalid for verification.");
    }

    const activationToken = createActivationToken({
      _id: user._id.toString(),
      email: targetEmail,
    });

    const activationUrl = `${config.domain}/activate?token=${activationToken}`;

    await sendEmail({
      to: targetEmail,
      subject: "Resend: Verify your HelpDex account",
      heading: "Email Verification Needed",
      message:
        "Click the button below to verify your email and continue using HelpDex.",
      buttonText: "Verify Account",
      buttonUrl: activationUrl,
    });

    res.status(200).json({
      message: `Verification email has been resent to ${targetEmail}.`,
    });
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
      res.status(200).json({ message: "OTP sent to your email." });
      return;
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

    console.log(email, otp, newPassword);

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

// @desc    Resend OTP for password reset
// @route   POST /api/v1/users/resend-reset-otp
// @access  Public
export const resendResetOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      res.status(400);
      throw new Error("Email is required.");
    }

    // Find the user
    const user = await User.findOne({ email });

    // Respond with generic message even if user doesn't exist
    if (!user) {
      res.status(200).json({ message: "OTP sent to your email." });
      return;
    }

    // Generate new OTP and expiry
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user record
    user.resetOtp = otp;
    user.resetOtpExpiresAt = expiresAt;
    await user.save();

    // Send email
    await sendEmail({
      to: email,
      subject: "HelpDex Password Reset OTP",
      heading: "Reset Your Password",
      message:
        "Use the OTP below to reset your password. It's valid for 10 minutes.",
      otp,
    });

    res.status(200).json({ message: "OTP has been resent to your email." });
  }
);

// @desc    Logout user by clearing refresh token cookie
// @route   POST /api/v1/users/logout
// @access  Public
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    path: "/api/v1/users/refresh-token",
    httpOnly: true,
    sameSite: "strict", // or "Lax"
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ msg: "Logged out successfully" });
});

// @desc    Get all users with the role of "developer"
// @route   GET /api/v1/users/developers
// @access  Protected (QA, Admin)
// Only return id, name, email
export const getDevelopers = asyncHandler(
  async (req: Request, res: Response) => {
    const developers = await User.find({ role: "developer" })
      .select("_id name email")
      .lean();

    res.status(200).json({ success: true, developers });
  }
);

// @desc    Upload user avatar
// @route   POST /api/v1/users/upload-avatar
// @access  Protected
export const uploadAvatar = async (req: Request, res: Response) => {
  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "Avatar upload failed" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized. User not found." });
    }

    const uploaded = files.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    try {
      const buffer = await fileToBuffer(file as File);

      const currentUser = await User.findById(req.user._id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found." });
      }

      // Delete previous avatar from Cloudinary if public_id exists
      if (currentUser.avatar?.public_id) {
        await deleteFromCloudinary(currentUser.avatar.public_id);
      }

      // Upload new avatar
      const result = await uploadBufferToCloudinary(buffer, "helpdex/avatars");

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          avatar: {
            url: result.secure_url,
            public_id: result.public_id,
          },
        },
        { new: true }
      ).select("-password");

      res.status(200).json({
        message: "Avatar uploaded successfully",
        avatar: {
          url: result.secure_url,
          public_id: result.public_id,
        },
        user,
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  });
};

// @desc    Update basic profile (name, companyName)
// @route   PUT /api/v1/users/update-basic
// @access  Private (Logged-in users only)
export const updateBasicProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { name, companyName } = req.body;

    if (!name?.trim() || !companyName?.trim()) {
      res.status(400);
      throw new Error("Name and company name are required.");
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        name: name.trim(),
        companyName: companyName.trim(),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(500);
      throw new Error("Failed to update profile.");
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  }
);

// @desc    Update user password
// @route   PUT /api/v1/users/update-password
// @access  Private (authenticated)
export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const currentPassword = req.body.currentPassword?.trim();
    const newPassword = req.body.newPassword?.trim();

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Both current and new passwords are required.");
    }

    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error("Unauthorized.");
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error("Current password is incorrect.");
    }

    if (currentPassword === newPassword) {
      res.status(400);
      throw new Error(
        "New password must be different from the current password."
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  }
);

// @desc    Update user email (pending verification)
// @route   PUT /api/v1/users/update-email
// @access  Private (authenticated)
export const updateEmail = asyncHandler(async (req: Request, res: Response) => {
  const { newEmail, currentPassword } = req.body;

  if (!newEmail || typeof newEmail !== "string") {
    res.status(400);
    throw new Error("New email is required.");
  }

  if (!currentPassword || typeof currentPassword !== "string") {
    res.status(400);
    throw new Error("Current password is required.");
  }

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Unauthorized.");
  }

  const normalizedNewEmail = newEmail.toLowerCase().trim();

  // Check if the new email is already in use by another account or pending verification
  const emailInUse = await User.findOne({
    $or: [{ email: normalizedNewEmail }, { pendingEmail: normalizedNewEmail }],
  });

  if (emailInUse) {
    res.status(409);
    throw new Error(
      "Email is already in use or pending verification for email change."
    );
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect.");
  }

  // Save new email temporarily in `pendingEmail`
  user.pendingEmail = normalizedNewEmail;
  await user.save();

  const activationToken = createActivationToken({
    _id: user._id.toString(),
    email: user.pendingEmail,
  });

  const activationUrl = `${config.domain}/activate?token=${activationToken}`;

  await sendEmail({
    to: user.pendingEmail,
    subject: "Confirm your new email for HelpDex",
    heading: "Verify Your New Email",
    message:
      "You requested to change your email. Please verify your new email address by clicking the button below.",
    buttonText: "Verify New Email",
    buttonUrl: activationUrl,
  });

  res.status(200).json({
    message: `Verification link has been sent to ${user.pendingEmail}. Please verify to complete the email update.`,
  });
});

// @desc    Cancel pending email change
// @route   PUT /api/v1/users/cancel-pending-email
// @access  Private
export const cancelPendingEmail = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.user._id) {
      res.status(401);
      throw new Error("Unauthorized.");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (!user.pendingEmail) {
      res.status(400);
      throw new Error("No pending email to cancel.");
    }

    user.pendingEmail = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Pending email change has been cancelled." });
  }
);

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Access denied");
  }

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const filters = JSON.parse((req.query.filters as string) || "[]");

  const query: Record<string, any> = {};

  for (const filter of filters) {
    const { id, value } = filter;

    // Convert boolean strings to actual booleans
    if (id === "isEmailVerified" || id === "isApprovedByAdmin") {
      query[id] = value === "true";
    } else {
      query[id] = value;
    }
  }

  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .select("-password -resetOtp");

  res.status(200).json({ users, total });
});

// @desc    Update user role or admin approval (admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Access denied");
  }

  const { id } = req.params;
  const { role, isApprovedByAdmin } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (role) user.role = role;
  if (typeof isApprovedByAdmin === "boolean") {
    user.isApprovedByAdmin = isApprovedByAdmin;
    user.adminApprovedAt = isApprovedByAdmin ? new Date() : undefined;
  }

  await user.save();

  const updatedUser = await User.findById(id).select("-password -resetOtp");
  res.status(200).json({ success: true, user: updatedUser });
});
