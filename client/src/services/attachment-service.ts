import axiosInstance from "../utils/axios";
import type { AxiosError } from "axios";

/**
 * Deletes an attachment by its ID
 * @param id - The MongoDB _id of the attachment to delete
 */
export const deleteAttachment = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/attachments/${id}`);
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to delete attachment."
    );
  }
};
