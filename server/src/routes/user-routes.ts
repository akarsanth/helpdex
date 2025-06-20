import express from "express";
import {
  register,
  login,
  getAccessToken,
  resendVerification,
  verifyEmail,
  approveUser,
  forgotPassword,
  resetPassword,
  resendResetOtp,
} from "../controllers/user-controllers";
import { protect } from "../middlewares/auth";
import { authorizeAdmin } from "../middlewares/authorize";
const router = express.Router();

router.post("/", register);
router.post("/login", login);
router.post("/refresh-token", getAccessToken);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-otp", resendResetOtp);

// Admin
router.post("/:id/approve", protect, authorizeAdmin, approveUser);

export default router;
