import { Request, Response, NextFunction } from "express";
import Category from "../models/category-model";

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Protected
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all category documents from the database
    const categories = await Category.find({});

    // Send response with category list
    res.status(200).json(categories);
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};
