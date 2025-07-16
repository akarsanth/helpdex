import { Request, Response } from "express";
import { IncomingForm } from "formidable";
import Attachment from "../models/attachment-model";
import type { File } from "formidable";
import {
  fileToBuffer,
  uploadBufferToCloudinary,
} from "../utils/cloudinary-upload";
import asyncHandler from "express-async-handler";
import { deleteFromCloudinary } from "../utils/cloudinary-upload";

// @desc    Upload an attachment file
// @route   POST /api/v1/attachments/upload
// @access  Protected
export const uploadAttachment = async (req: Request, res: Response) => {
  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const uploaded = files.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    try {
      const buffer = await fileToBuffer(file as File);
      const result = await uploadBufferToCloudinary(
        buffer,
        "helpdex/attachments"
      );

      const attachment = await Attachment.create({
        filename: result.public_id,
        original_name: file.originalFilename || "untitled",
        mime_type: file.mimetype || "application/octet-stream",
        size: file.size,
        path: result.secure_url,
        uploaded_at: new Date(),
      });

      res.status(201).json({ success: true, attachment });
    } catch (uploadError) {
      console.error(uploadError);
      res.status(500).json({ error: "Failed to upload to Cloudinary" });
    }
  });
};

// @desc    Delete an uploaded attachment
// @route   DELETE /api/v1/attachments/:id
// @access  Protected
export const deleteAttachment = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const attachment = await Attachment.findById(id);
    if (!attachment) {
      res.status(404);
      throw new Error("Attachment not found");
    }

    // Delete from Cloudinary using filename (public_id)
    await deleteFromCloudinary(attachment.filename);

    // Remove from DB
    await attachment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attachment deleted successfully",
    });
  }
);
