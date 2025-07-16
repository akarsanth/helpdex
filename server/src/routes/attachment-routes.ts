import express from "express";
import {
  uploadAttachment,
  deleteAttachment,
} from "../controllers/attachment-controller";
import { protect } from "../middlewares/auth";

const router = express.Router();

/**
 * @route   POST /api/v1/attachments/upload
 * @desc    Upload an attachment file
 * @access  Protected
 */
router.post("/upload", protect, uploadAttachment);

/**
 * @route   DELETE /api/v1/attachments/:id
 * @desc    Delete an uploaded attachment
 * @access  Protected
 */
router.delete("/:id", protect, deleteAttachment);

export default router;
