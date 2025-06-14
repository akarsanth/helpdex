import express from "express";
import {
  register,
  login,
  getAccessToken,
  resendVerification,
  verifyEmail,
} from "../controllers/user-controllers";
const router = express.Router();

router.post("/", register);
router.post("/login", login);
router.post("/refresh-token", getAccessToken);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

export default router;
