import express from "express";
import { createTicket, myTickets } from "../controllers/ticket-controllers";
import { protect } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/authorize";

const router = express.Router();

router.post("/", protect, authorizeRoles("client"), createTicket);
router.get("/my", protect, authorizeRoles("client"), myTickets);

export default router;
