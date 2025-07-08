import express from "express";
import { uploadAttachment } from "../controllers/attachment-controller";
import { protect } from "../middlewares/auth";

const router = express.Router();

// POST /api/v1/attachments/upload
router.post("/upload", protect, uploadAttachment);

export default router;
