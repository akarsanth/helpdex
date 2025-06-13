import asyncHandler from "express-async-handler";
import User from "../models/user-model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import sendEmail from "../utils/sendEmail";
import config from "../config";

// @desc    Add new user
// @route   POST /api/v1/users
// @access  Public (anything can hit it)
// Define expected request body
interface RegisterRequestBody {
  name: string;
  companyName: string;
  email: string;
  password: string;
}

const register = asyncHandler(
  async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    const { name, companyName, email, password } = req.body;
    console.log(companyName);

    if (!name || !companyName || !email || !password) {
      res.status(400);
      throw new Error("All fields are required.");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      // Bad request
      res.status(400);
      throw new Error("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

      // Build activation URL
      const activationUrl = `${config.domain}/activate/${activationToken}`;
      // Send activation email
      await sendEmail(email, activationUrl, "Verify your account");

      // Respond to client
      res.status(201).json({
        message: `Registration successful. Please check your email "${email}" to activate your account.`,
      });
    } else {
      // 400 => Bad Request
      res.status(400);
      throw new Error("Failed to create user.");
    }
  }
);

// Helper to create activation token
const createActivationToken = (user: { _id: string; email: string }) => {
  return jwt.sign(user, process.env.ACTIVATION_TOKEN_SECRET as string, {
    expiresIn: "30m",
  });
};

export { register };
