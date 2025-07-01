import express from "express";
import { IncomingForm } from "formidable";
import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import Attachment from "../models/attachment-model";
import { cloudinary } from "../utils/cloudinary"; // uses the configured instance
import type { File } from "formidable";

const router = express.Router();

// POST /api/v1/attachments/upload
router.post("/upload", async (req, res) => {
  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const uploaded = files.file;
    const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    const buffer = await fileToBuffer(file as File);

    const uploadToCloudinary = (): Promise<UploadApiResponse> =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "helpdex/attachments",
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error("Cloudinary upload failed with no specific error provided."));
            }
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    try {
      const result = await uploadToCloudinary();

      const attachment = await Attachment.create({
        filename: result.public_id,
        original_name: file.originalFilename || "untitled",
        mime_type: file.mimetype || "application/octet-stream",
        size: file.size,
        path: result.secure_url,
        uploaded_at: new Date(),
      });

      res.status(201).json(attachment);
    } catch (uploadError) {
      console.error(uploadError);
      res.status(500).json({ error: "Failed to upload to Cloudinary" });
    }
  });
});

export default router;

// Helper to convert Formidable file to Buffer
const fileToBuffer = async (file: File): Promise<Buffer> => {
  const fs = await import("fs/promises");
  return fs.readFile(file.filepath);
};
