import express from "express";
import { getAllCategories } from "../controllers/category-controllers";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.get("/", protect, getAllCategories); // GET /api/v1/categories

export default router;
