import express from "express";
import {
  createTicket,
  myTickets,
  getTicketById,
  updateTicketStatus,
  assignDeveloper,
  getTickets,
  updateTicketDetails,
} from "../controllers/ticket-controllers";
import { protect } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/authorize";

const router = express.Router();

router.post("/", protect, authorizeRoles("client"), createTicket);
router.get("/my", protect, authorizeRoles("client"), myTickets);

// generic list route
router.get(
  "/",
  protect,
  authorizeRoles("client", "developer", "qa"),
  getTickets
);

router.get(
  "/:ticketId",
  protect,
  authorizeRoles("client", "developer", "qa"),
  getTicketById
);

// New route for status update
router.patch(
  "/:ticketId/status",
  protect,
  authorizeRoles("developer", "qa"),
  updateTicketStatus
);

// Only QA can assign developers
router.patch(
  "/:ticketId/assign",
  protect,
  authorizeRoles("qa"),
  assignDeveloper
);

// Route to update ticket fields (title, desc, priority, category, deadline)
router.patch(
  "/:ticketId",
  protect,
  authorizeRoles("client", "qa", "developer"),
  updateTicketDetails
);

export default router;
