import express from "express";
import {
  createTicket,
  myTickets,
  getTicketById,
} from "../controllers/ticket-controllers";
import { protect } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/authorize";

const router = express.Router();

router.post("/", protect, authorizeRoles("client"), createTicket);
router.get("/my", protect, authorizeRoles("client"), myTickets);
router.get(
  "/:ticketId",
  protect,
  authorizeRoles("client", "developer", "qa"),
  getTicketById
);

export default router;
