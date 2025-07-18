import express from "express";
import {
  createTicket,
  getTicketById,
  updateTicketStatus,
  assignDeveloper,
  getTickets,
  getTicketSummary,
  updateTicketDetails,
  getAverageResolutionTime,
} from "../controllers/ticket-controllers";
import { protect } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/authorize";

const router = express.Router();

router.post("/", protect, authorizeRoles("client"), createTicket);

// generic list route
router.get(
  "/",
  protect,
  authorizeRoles("client", "developer", "qa"),
  getTickets
);

// Summary for dashboard
router.get(
  "/summary",
  protect,
  authorizeRoles("client", "developer", "qa"),
  getTicketSummary
);

// Average resolution time (QA)
router.get(
  "/average-resolution-time",
  protect,
  authorizeRoles("qa"),
  getAverageResolutionTime
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
