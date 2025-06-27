import express from "express";
import { getAllStatuses } from "../controllers/status-controllers";

const router = express.Router();

router.get("/", getAllStatuses); // GET /api/v1/statuses

export default router;
