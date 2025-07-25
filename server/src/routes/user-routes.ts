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
  logout,
  getDevelopers,
  uploadAvatar,
  updateBasicProfile,
  updatePassword,
  updateEmail,
  cancelPendingEmail,
  getAllUsers,
  updateUser,
} from "../controllers/user-controllers";
import { protect } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/authorize";
const router = express.Router();

router.post("/", register);
router.post("/login", login);
router.post("/refresh-token", getAccessToken);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-otp", resendResetOtp);
router.get("/logout", logout);

// Admin
router.post("/:id/approve", protect, authorizeRoles("admin"), approveUser);

// Get developers
router.get(
  "/developers",
  protect,
  authorizeRoles("qa", "admin"), // optional: restrict access
  getDevelopers
);

// Upload
router.post("/upload-avatar", protect, uploadAvatar);
// Update basic info
router.put("/update-basic", protect, updateBasicProfile);
// Update Password
router.put("/update-password", protect, updatePassword);
// Update email
router.put("/update-email", protect, updateEmail);
// cancel email update
router.put("/cancel-pending-email", protect, cancelPendingEmail);
export default router;

router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.put("/:id", protect, authorizeRoles("admin"), updateUser);
