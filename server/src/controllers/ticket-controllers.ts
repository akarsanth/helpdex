import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Ticket from "../models/ticket-model";
import Attachment from "../models/attachment-model";
import { IUser } from "../models/user-model";
import {
  isValidStatusTransition,
  StatusName,
} from "../utils/status-transition";
import User from "../models/user-model";
import Comment from "../models/comment-model";

// @desc    Create a new support ticket
// @route   POST /api/v1/tickets
// @access  Protected (Client)
export const createTicket = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, priority, category_id, attachments } = req.body;

    if (!title || !priority || !category_id) {
      res.status(400);
      throw new Error("Title, priority, and category are required.");
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      category_id,
      created_by: (req.user as IUser)._id,
    });

    if (Array.isArray(attachments) && attachments.length > 0) {
      await Attachment.updateMany(
        { _id: { $in: attachments } },
        { $set: { ticket_id: ticket._id } }
      );
    }

    res.status(201).json({
      message: "Ticket created successfully.",
      ticket,
    });
  }
);

// @desc    Get all tickets created by the logged-in user
// @route   GET /api/v1/tickets/my
// @access  Protected (Client)
export const myTickets = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const { status, fromDate, toDate, page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = {
    created_by: user._id,
  };

  // Filter by status (since it's a string now)
  if (status && typeof status === "string") {
    filter.status = status;
  }

  // Optional date filter
  const createdAtFilter: Record<string, Date> = {};
  if (fromDate && typeof fromDate === "string") {
    const from = new Date(fromDate);
    if (!isNaN(from.getTime())) createdAtFilter.$gte = from;
  }
  if (toDate && typeof toDate === "string") {
    const to = new Date(toDate);
    if (!isNaN(to.getTime())) createdAtFilter.$lte = to;
  }
  if (Object.keys(createdAtFilter).length) {
    filter.createdAt = createdAtFilter;
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("category_id", "name")
      .lean()
      .then((docs) =>
        docs.map(({ category_id, ...rest }) => ({
          ...rest,
          category: category_id,
        }))
      ),
    Ticket.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: tickets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single ticket by ID
// @route   GET /api/v1/tickets/:ticketId
// @access  Protected (creator, assigned developer, or any QA)
export const getTicketById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { ticketId } = req.params;

    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error("Invalid ticket ID.");
    }

    const ticket = await Ticket.findById(ticketId)
      .populate("category_id", "name")
      .populate("created_by", "name email")
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email")
      .populate("closed_by", "name email")
      .lean();

    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found.");
    }

    const userId = user._id.toString();
    const isCreator = ticket.created_by._id.toString() === userId;
    const isAssignedDev = ticket.assigned_to?._id?.toString() === userId;
    const isQA = user.role === "qa";

    if (!isCreator && !isAssignedDev && !isQA) {
      res.status(403);
      throw new Error(
        "Access denied. You are not authorized to view this ticket."
      );
    }

    // Fetch comments
    let comments = await Comment.find({ ticket_id: ticketId })
      .populate("user_id", "name email role")
      .sort({ created_at: 1 })
      .lean();

    //  If the current user is a client, filter out internal comments
    if (user.role === "client") {
      comments = comments.filter((c) => !c.is_internal);
    }

    const { category_id, ...rest } = ticket;

    res.status(200).json({
      success: true,
      data: {
        ...rest,
        category: category_id,
        comments,
      },
    });
  }
);

// @desc    Update ticket status (based on role-based transitions)
// @route   PATCH /api/v1/tickets/:ticketId/status
// @access  Protected (QA or Developer depending on role)
export const updateTicketStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      res.status(400);
      throw new Error("New status is required.");
    }

    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error("Invalid ticket ID.");
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found.");
    }

    // Only allow dev if assigned
    if (
      user.role === "developer" &&
      (!ticket.assigned_to ||
        ticket.assigned_to.toString() !== user._id.toString())
    ) {
      res.status(403);
      throw new Error("Access denied. You are not assigned to this ticket.");
    }

    const isValid = isValidStatusTransition(
      ticket.status,
      status as StatusName,
      user.role
    );
    if (!isValid) {
      res.status(400);
      throw new Error(
        `Invalid status transition from ${ticket.status} to ${status} for role ${user.role}.`
      );
    }

    // Update status and timestamps
    ticket.status = status as StatusName;
    const now = new Date();

    switch (status) {
      case "Assigned":
        ticket.assigned_at = now;
        ticket.assigned_by = user._id;
        break;
      case "Resolved":
        ticket.resolved_at = now;
        break;
      case "Closed":
        ticket.closed_by = user._id;
        ticket.closed_at = now;
        break;
      case "Reopened":
        ticket.reopened_at = now;
        break;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate("category_id", "name")
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email")
      .populate("closed_by", "name email")
      .populate("created_by", "name email")
      .lean();

    if (!updatedTicket) {
      res.status(500);
      throw new Error("Failed to populate updated ticket.");
    }
    const { category_id, ...rest } = updatedTicket;
    res.status(200).json({
      success: true,
      message: "Ticket status updated.",
      ticket: { category: category_id, ...rest },
    });
  }
);

// @desc    Assign a developer to a ticket
// @route   PATCH /api/v1/tickets/:ticketId/assign
// @access  Protected (QA only)
export const assignDeveloper = asyncHandler(
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const { developerId } = req.body;
    const qaUser = req.user as IUser;

    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error("Invalid ticket ID.");
    }

    if (!developerId || !developerId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error("Invalid developer ID.");
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found.");
    }

    const developer = await User.findById(developerId);
    if (!developer || developer.role !== "developer") {
      res.status(400);
      throw new Error("Selected user is not a valid developer.");
    }

    ticket.assigned_to = developer._id;
    ticket.assigned_by = qaUser._id;
    ticket.assigned_at = new Date();
    ticket.status = "Assigned";

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate("category_id", "name")
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email")
      .populate("closed_by", "name email")
      .populate("created_by", "name email")
      .lean();

    if (!updatedTicket) {
      res.status(500);
      throw new Error("Failed to populate updated ticket.");
    }
    const { category_id, ...rest } = updatedTicket;

    res.status(200).json({
      success: true,
      message: "Ticket status updated.",
      ticket: {
        ...rest,
        category: category_id, // mapped
      },
    });
  }
);
