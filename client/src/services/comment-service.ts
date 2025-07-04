import axiosInstance from "../utils/axios";
import { AxiosError } from "axios";
import type { Comment } from "../types/comment";

// POST a new comment
export const addComment = async ({
  ticketId,
  comment,
  is_internal = false,
}: {
  ticketId: string;
  comment: string;
  is_internal?: boolean;
}): Promise<Comment> => {
  try {
    const response = await axiosInstance.post<{
      success: boolean;
      comment: Comment;
    }>("/api/v1/comments", {
      ticket_id: ticketId,
      comment,
      is_internal,
    });
    return response.data.comment;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to add comment."
    );
  }
};
