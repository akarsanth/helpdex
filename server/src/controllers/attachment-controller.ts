import { Request, Response } from "express";
import { IncomingForm } from "formidable";
import Attachment from "../models/attachment-model";
import { uploadFileToCloudinary } from "../utils/cloudinary-upload";

// @desc    Upload an attachment file
// @route   POST /api/v1/attachments/upload
// @access  Protected (QA, Developer, etc.)
export const uploadAttachment = async (req: Request, res: Response) => {
  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const uploaded = files.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;

    try {
      const result = await uploadFileToCloudinary(file, "helpdex/attachments");

      const attachment = await Attachment.create({
        filename: result.public_id,
        original_name: file.originalFilename || "untitled",
        mime_type: file.mimetype || "application/octet-stream",
        size: file.size,
        path: result.secure_url,
        uploaded_at: Date.now(),
      });

      res.status(201).json(attachment);
    } catch (uploadError) {
      console.error(uploadError);
      res.status(500).json({ error: "Failed to upload attachment" });
    }
  });
};
