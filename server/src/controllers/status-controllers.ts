import { Request, Response, NextFunction } from "express";
import Status from "../models/status-model";

// @desc    Get all statuses
// @route   GET /api/v1/statuses
// @access  Public or Protected (based on use-case)
export const getAllStatuses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all status documents from the database
    const statuses = await Status.find({});

    // Send response with status list
    res.status(200).json(statuses);
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};
