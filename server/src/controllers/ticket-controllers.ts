import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Ticket from "../models/ticket-model";
import Status from "../models/status-model";
import Attachment from "../models/attachment-model";
import { IUser } from "../models/user-model";

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

    const openStatus = await Status.findOne({ name: "Open" });
    if (!openStatus) {
      res.status(500);
      throw new Error("Default status 'Open' not found.");
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
      .populate("verified_by", "name email")
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

    const { category_id, assigned_to, assigned_by, verified_by, ...rest } =
      ticket;

    res.status(200).json({
      success: true,
      data: {
        ...rest,
        category: category_id,
        assigned_to,
        assigned_by,
        verified_by,
      },
    });
  }
);
