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
import Notification from "../models/notification-model";
import sendEmail from "../utils/send-email";
import config from "../config";

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

    console.log(attachments);

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

    if (user.role === "client") {
      comments = comments.filter((c) => !c.is_internal);
    }

    // Fetch attachments
    const attachments = await Attachment.find({ ticket_id: ticketId })
      .select("_id original_name path")
      .lean();

    const { category_id, ...rest } = ticket;

    res.status(200).json({
      success: true,
      data: {
        ...rest,
        category: category_id,
        comments,
        attachments, // Include here
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

    // Developer can only update their assigned tickets
    if (
      user.role === "developer" &&
      (!ticket.assigned_to ||
        ticket.assigned_to.toString() !== user._id.toString())
    ) {
      res.status(403);
      throw new Error("Access denied. You are not assigned to this ticket.");
    }

    // Validate status transition
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

    // Apply status and timestamps (only where relevant)
    const now = new Date();
    ticket.status = status as StatusName;

    switch (status) {
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
      // No timestamp for Acknowledged or In Progress
    }

    await ticket.save();

    // Re-fetch full populated ticket
    const updatedTicket = (await Ticket.findById(ticketId)
      .populate("category_id", "name")
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email")
      .populate("closed_by", "name email")
      .populate("created_by", "name email")
      .lean()) as unknown as {
      _id: string;
      title: string;
      created_by?: { _id: string; email: string; name: string };
      assigned_to?: { _id: string; email: string; name: string };
      category_id: { name: string };
    };

    if (!updatedTicket) {
      res.status(500);
      throw new Error("Failed to populate updated ticket.");
    }

    // Email and Notification (only for select statuses)
    try {
      let recipientEmail: string | undefined;
      let recipientUserId: string | undefined;
      let message = "";
      let buttonUrl = "";

      switch (status) {
        case "Resolved":
        case "Closed":
          if (
            updatedTicket.created_by?.email &&
            updatedTicket.created_by?._id
          ) {
            recipientEmail = updatedTicket.created_by.email;
            recipientUserId = updatedTicket.created_by._id;
            message = `Your ticket "${updatedTicket.title}" has been ${status.toLowerCase()}.`;
            buttonUrl = `${config.domain}/tickets/${ticket._id}`;
          }
          break;

        case "Reopened":
          if (
            updatedTicket.assigned_to?.email &&
            updatedTicket.assigned_to?._id
          ) {
            recipientEmail = updatedTicket.assigned_to.email;
            recipientUserId = updatedTicket.assigned_to._id;
            message = `Ticket "${updatedTicket.title}" has been reopened. Please review.`;
            buttonUrl = `${config.domain}/assigned/${ticket._id}`;
          }
          break;
      }

      if (recipientEmail && recipientUserId && buttonUrl) {
        await sendEmail({
          to: recipientEmail,
          subject: `Ticket Status Updated: ${status}`,
          heading: "Ticket Update",
          message,
          buttonText: "View Ticket",
          buttonUrl,
        });

        await Notification.create({
          user_id: recipientUserId,
          ticket_id: ticket._id,
          message,
        });
      }
    } catch (error) {
      console.error("Email or notification failed:", error);
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

    // send email
    await sendEmail({
      to: developer.email,
      subject: "You have been assigned a new ticket",
      heading: "New Ticket Assignment",
      message: `You have been assigned to the ticket: "${ticket.title}". Please check the ticket details and start work accordingly.`,
      buttonText: "View Ticket",
      buttonUrl: `${config.domain}/assigned/${ticket._id}`,
    });

    // Create notification for the developer
    await Notification.create({
      ticket_id: ticket._id,
      user_id: developer._id,
      message: `You have been assigned to ticket: "${ticket.title}"`,
    });

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
        category: category_id,
      },
    });
  }
);

// @desc    Get paginated ticket list with optional search
// @route   GET /api/v1/tickets
// @access  Private
export const getTickets = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const search = req.query.search?.toString() || "";

  const query: any = {};

  // Role-based ticket access
  if (user.role === "client") {
    query.created_by = user._id;
  } else if (user.role === "developer") {
    query.assigned_to = user._id;
  }

  // Global search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Handle column filters
  const filters = JSON.parse((req.query.filters as string) || "[]");

  for (const filter of filters) {
    const { id, value } = filter;
    if (!value) continue;
    if (id === "status") query.status = value;
    if (id === "priority") query.priority = value;
    if (id === "category_id") query.category_id = value;
  }

  // --- Handle date range filter (createdAt) ---
  const from = req.query.from ? new Date(req.query.from.toString()) : null;
  const to = req.query.to ? new Date(req.query.to.toString()) : null;
  if (from && to) {
    query.createdAt = { $gte: from, $lte: to };
  } else if (from) {
    query.createdAt = { $gte: from };
  } else if (to) {
    query.createdAt = { $lte: to };
  }

  const total = await Ticket.countDocuments(query);

  const ticketsRaw = await Ticket.find(query)
    .populate("category_id", "name")
    .populate("created_by", "name email")
    .populate("assigned_to", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  const tickets = ticketsRaw.map((ticket) => {
    const t = ticket.toObject();
    return {
      ...t,
      category: t.category_id,
      category_id: undefined,
    };
  });

  res.status(200).json({ tickets, total });
});

// @desc    Get role-based ticket summary (client, qa, developer)
// @route   GET /api/v1/tickets/summary
// @access  Private
export const getTicketSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;

    const now = new Date();
    const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    if (user.role === "client") {
      // Status count
      const statusCounts = await Ticket.aggregate([
        { $match: { created_by: user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const statusCountObj: Record<string, number> = {};
      statusCounts.forEach((item) => {
        statusCountObj[item._id] = item.count;
      });

      // Upcoming tickets (next 5 days, deadline in future)
      const upcomingTickets = await Ticket.find({
        created_by: user._id,
        deadline: {
          $exists: true,
          $ne: null,
          $gte: now,
          $lte: fiveDaysFromNow,
        },
      })
        .select("title status deadline")
        .sort({ deadline: 1 });

      res.status(200).json({
        statusCounts: statusCountObj,
        upcomingTickets,
      });
      return;
    }

    if (user.role === "developer") {
      // Status count for assigned tickets
      const statusCounts = await Ticket.aggregate([
        { $match: { assigned_to: user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const statusCountObj: Record<string, number> = {};
      statusCounts.forEach((item) => {
        statusCountObj[item._id] = item.count;
      });

      // Upcoming tickets (next 5 days, deadline in future)
      const upcomingTickets = await Ticket.find({
        assigned_to: user._id,
        deadline: {
          $exists: true,
          $ne: null,
          $gte: now,
          $lte: fiveDaysFromNow,
        },
      })
        .select("title status deadline")
        .sort({ deadline: 1 });

      // Recently assigned (sort by assigned_at descending, limit 3)
      const recentAssignedTickets = await Ticket.find({
        assigned_to: user._id,
      })
        .select("title status assigned_at")
        .sort({ assigned_at: -1 })
        .limit(3);

      // Overdue tickets (deadline < now, not closed/resolved)
      const overdueTickets = await Ticket.find({
        assigned_to: user._id,
        deadline: { $exists: true, $ne: null, $lt: now },
        status: { $nin: ["Resolved", "Closed"] },
      })
        .select("title status deadline")
        .sort({ deadline: 1 });

      res.status(200).json({
        statusCounts: statusCountObj,
        upcomingTickets,
        recentAssignedTickets,
        overdueTickets,
      });
      return;
    }

    if (user.role === "qa") {
      // Status counts for all tickets
      const statusCounts = await Ticket.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const statusCountObj: Record<string, number> = {};
      statusCounts.forEach((item) => {
        statusCountObj[item._id] = item.count;
      });

      // Upcoming tickets (next 5 days, deadline in future)
      const upcomingTickets = await Ticket.find({
        deadline: {
          $exists: true,
          $ne: null,
          $gte: now,
          $lte: fiveDaysFromNow,
        },
      })
        .select("title status deadline")
        .sort({ deadline: 1 });

      // Overdue tickets: deadline in past, not closed/resolved
      const overdueTickets = await Ticket.find({
        deadline: { $exists: true, $ne: null, $lt: now },
        status: { $nin: ["Closed", "Resolved"] },
      })
        .select("title status deadline")
        .sort({ deadline: 1 });

      res.status(200).json({
        statusCounts: statusCountObj,
        upcomingTickets,
        overdueTickets,
      });
      return;
    }

    res.status(400).json({ message: "Invalid role for summary." });
  }
);

// @desc    Get average ticket resolution time (in ms, readable string, and count)
// @route   GET /api/v1/tickets/average-resolution-time?from=YYYY-MM-DD&to=YYYY-MM-DD
// @access  Private (QA)
export const getAverageResolutionTime = asyncHandler(
  async (req: Request, res: Response) => {
    const fromStr = req.query.from;
    const toStr = req.query.to;

    const from = typeof fromStr === "string" ? new Date(fromStr) : undefined;
    const to = typeof toStr === "string" ? new Date(toStr) : undefined;

    // Validation: If only one is set, both must be set
    if ((from && !to) || (!from && to)) {
      res
        .status(400)
        .json({ message: "Both from and to must be set or both unset" });
      return;
    }
    if (from && isNaN(from.getTime())) {
      res.status(400).json({ message: "Invalid 'from' date" });
      return;
    }
    if (to && isNaN(to.getTime())) {
      res.status(400).json({ message: "Invalid 'to' date" });
      return;
    }

    // Only resolved tickets, with valid resolved_at and createdAt
    const match: any = {
      status: "Resolved",
      resolved_at: { $exists: true, $ne: null },
      createdAt: { $exists: true, $ne: null },
    };
    if (from) match.resolved_at.$gte = from;
    if (to) {
      const nextDay = new Date(to);
      nextDay.setDate(nextDay.getDate() + 1);
      match.resolved_at.$lt = nextDay;
    }

    const avgResult = await Ticket.aggregate([
      { $match: match },
      {
        $project: {
          diff: { $subtract: ["$resolved_at", "$createdAt"] },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTimeMs: { $avg: "$diff" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgMs = avgResult[0]?.avgResolutionTimeMs || 0;
    const count = avgResult[0]?.count || 0;

    function msToReadable(ms: number) {
      if (!ms) return "-";
      const totalMinutes = Math.floor(ms / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      let str = "";
      if (days) str += `${days}d `;
      if (hours) str += `${hours}h `;
      if (minutes) str += `${minutes}m`;
      return str.trim();
    }

    res.status(200).json({
      avgResolutionTimeMs: avgMs,
      avgResolutionTimeStr: msToReadable(avgMs),
      count,
    });
  }
);

// @desc    Update ticket fields
// @route   PUT /api/v1/tickets/:id
// @access  Private
export const updateTicketDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as IUser;
    const { ticketId } = req.params;
    const updateData = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404);
      throw new Error("Ticket not found");
    }

    // Check edit permissions based on role
    const editableFieldsByRole: Record<string, string[]> = {
      client: ["title", "description", "priority"],
      qa: ["priority", "category_id", "deadline"],
      developer: ["description"],
    };

    const allowedFields = editableFieldsByRole[user.role] || [];

    // Prevent editing if ticket is in a locked status
    const nonEditableStatuses = ["Resolved", "Closed"];
    if (nonEditableStatuses.includes(ticket.status)) {
      res.status(400);
      throw new Error(`Cannot edit ticket in '${ticket.status}' status.`);
    }

    // Update only allowed fields
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        ticket.set(field, updateData[field]);
      }
    }

    await ticket.save();

    res.status(200).json({ success: true, message: "Ticket updated", ticket });
  }
);
