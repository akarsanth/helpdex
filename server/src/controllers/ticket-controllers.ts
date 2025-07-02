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
      status_id: openStatus._id,
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
  const userId = user._id;

  const { status, fromDate, toDate, page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = {
    created_by: userId,
  };

  // Filter by status if provided
  if (status && typeof status === "string") {
    filter.status_id = status;
  }

  // Validate and apply date filters
  const createdAtFilter: Record<string, Date> = {};

  if (fromDate && typeof fromDate === "string") {
    const from = new Date(fromDate);
    if (!isNaN(from.getTime())) {
      createdAtFilter.$gte = from;
    }
  }

  if (toDate && typeof toDate === "string") {
    const to = new Date(toDate);
    if (!isNaN(to.getTime())) {
      createdAtFilter.$lte = to;
    }
  }

  if (Object.keys(createdAtFilter).length > 0) {
    filter.createdAt = createdAtFilter;
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("status_id", "name")
      .populate("category_id", "name")
      .lean()
      .then((docs) =>
        docs.map(({ category_id, status_id, ...rest }) => ({
          ...rest,
          category: category_id,
          status: status_id,
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


// @desc    Get a single ticket by ID (only accessible to its creator)
// @route   GET /api/v1/tickets/:ticketId
// @access  Protected (Client)
// @returns Ticket details including status, category, and assigned/verified info
export const getTicketById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { ticketId } = req.params;

    // Validate MongoDB ObjectId format
    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error("Invalid ticket ID.");
    }

    // Fetch ticket and populate related fields
    const ticket = await Ticket.findById(ticketId)
      .populate("status_id", "name")
      .populate("category_id", "name")
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email")
      .populate("verified_by", "name email")
      .lean();

    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found.");
    }

    // Allow access only if the ticket was created by the logged-in client
    if (ticket.created_by.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error("Access denied. You do not own this ticket.");
    }

    // Rename populated fields for frontend clarity
    const {
      status_id,
      category_id,
      assigned_to,
      assigned_by,
      verified_by,
      ...rest
    } = ticket;

    res.status(200).json({
      success: true,
      data: {
        ...rest,
        status: status_id,
        category: category_id,
        assigned_to,
        assigned_by,
        verified_by,
      },
    });
  }
);


