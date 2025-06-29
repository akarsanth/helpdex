import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Ticket from "../models/ticket-model";
import Status from "../models/status-model";
import Attachment from "../models/attachment-model";
import { IUser } from "../models/user-model";

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
