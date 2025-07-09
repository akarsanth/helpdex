import streamifier from "streamifier";
import fs from "fs/promises";
import { cloudinary } from "./cloudinary";
import type { UploadApiResponse } from "cloudinary";
import type { File } from "formidable";

/**
 * Converts a Formidable file to a Buffer
 */
export const fileToBuffer = async (file: File): Promise<Buffer> => {
  return fs.readFile(file.filepath);
};

/**
 * Uploads a buffer to Cloudinary under a specified folder
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
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
              new Error(
                "Cloudinary upload failed with no specific error provided."
              )
          );
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/**
 * Deletes a file from Cloudinary using its public ID.
 *
 * @param public_id - The unique identifier of the file on Cloudinary
 * @returns A Promise that resolves when the deletion is complete
 */
export const deleteFromCloudinary = async (public_id: string) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Failed to delete file from Cloudinary:", error);
  }
};
