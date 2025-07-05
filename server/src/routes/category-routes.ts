import express from "express";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category-controllers";

import { protect } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/authorize";

const router = express.Router();

// @route   GET /api/v1/categories
// @desc    Get all categories
// @access  Private (QA/Admin)
router.get("/", protect, getAllCategories);

// @route   POST /api/v1/categories
// @desc    Create a new category
// @access  Private (QA/Admin)
router.post("/", protect, createCategory);

// @route   PUT /api/v1/categories/:id
// @desc    Update a category
// @access  Private (QA/Admin)
router.put("/:id", protect, updateCategory);

// @route   DELETE /api/v1/categories/:id
// @desc    Delete a category
// @access  Private (QA/Admin)
router.delete("/:id", protect, deleteCategory);

export default router;
