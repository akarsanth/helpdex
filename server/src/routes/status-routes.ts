import express from "express";
import { getAllStatuses } from "../controllers/status-controllers";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.get("/", protect, getAllStatuses); // GET /api/v1/statuses

export default router;
