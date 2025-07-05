import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Category from "../models/category-model";

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Private (QA/Admin)
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  }
);

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private (QA/Admin)
export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name?.trim()) {
      res.status(400);
      throw new Error("Category name is required.");
    }

    // Check for duplicate name
    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      res.status(409);
      throw new Error("Category already exists.");
    }

    const category = await Category.create({ name: name.trim(), description });

    res.status(201).json({
      success: true,
      category,
    });
  }
);

// @desc    Update a category
// @route   PUT /api/v1/categories/:id
// @access  Private (QA/Admin)
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404);
      throw new Error("Category not found.");
    }

    // Update fields
    category.name = name?.trim() || category.name;
    category.description = description ?? category.description;

    const updated = await category.save();

    res.status(200).json({
      success: true,
      category: updated,
    });
  }
);

// @desc    Delete a category
// @route   DELETE /api/v1/categories/:id
// @access  Private (QA/Admin)
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404);
      throw new Error("Category not found.");
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  }
);
