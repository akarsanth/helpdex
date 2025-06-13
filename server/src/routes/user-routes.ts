import express from "express";
import {
  register,
  resendVerification,
  verifyEmail,
} from "../controllers/user-controllers";
const router = express.Router();

router.post("/", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

export default router;
