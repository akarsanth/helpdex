import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import { cloudinary } from "./cloudinary";
import type { File } from "formidable";
import fs from "fs/promises";

/**
 * Convert Formidable file to Buffer
 */
const fileToBuffer = async (file: File): Promise<Buffer> => {
  return fs.readFile(file.filepath);
};

/**
 * Upload file to Cloudinary (used for both attachments and avatars)
 */
export const uploadFileToCloudinary = async (
  file: File,
  folder: string
): Promise<UploadApiResponse> => {
  const buffer = await fileToBuffer(file);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            error ||
              new Error("Cloudinary upload failed with no specific error.")
          );
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
