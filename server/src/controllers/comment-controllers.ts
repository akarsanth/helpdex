import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Comment from "../models/comment-model";
import Ticket from "../models/ticket-model";
import type { IUser } from "../models/user-model";

// @desc    Add a comment to a ticket
// @route   POST /api/v1/comments
// @access  Private
export const addCommentToTicket = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { ticket_id, comment, is_internal = false } = req.body;

    if (!ticket_id || !comment?.trim()) {
      res.status(400);
      throw new Error("Ticket ID and comment text are required.");
    }

    // Check if the ticket exists
    const ticket = await Ticket.findById(ticket_id)
      .populate("created_by")
      .populate("assigned_to");

    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found.");
    }

    const userId = user._id.toString();

    const isCreator = ticket.created_by?._id?.toString() === userId;
    const isAssignedDev = ticket.assigned_to?._id?.toString() === userId;
    const isQA = user.role === "qa";

    // Only allow ticket creator, assigned developer, or QA to comment
    if (!isCreator && !isAssignedDev && !isQA) {
      res.status(403);
      throw new Error("You are not authorized to comment on this ticket.");
    }

    // Only QA or developer can post internal comments
    if (is_internal && user.role === "client") {
      res.status(403);
      throw new Error("Clients cannot post internal comments.");
    }

    // Create and populate the comment
    const newComment = await Comment.create({
      ticket_id,
      user_id: user._id,
      comment,
      is_internal,
    });

    const populated = await newComment.populate("user_id", "name email role");

    res.status(201).json({
      success: true,
      comment: populated,
    });
  }
);
