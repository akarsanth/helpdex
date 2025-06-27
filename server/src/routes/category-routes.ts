import express from "express";
import { getAllCategories } from "../controllers/category-controllers";

const router = express.Router();

router.get("/", getAllCategories); // GET /api/v1/categories

export default router;
