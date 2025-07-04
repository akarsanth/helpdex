import express from "express";
import { protect } from "../middlewares/auth";
import { addCommentToTicket } from "../controllers/comment-controllers";
import { authorizeRoles } from "../middlewares/authorize";

const router = express.Router();

// @route   POST /api/v1/comments
// @access  Private
router.post(
  "/",
  protect,
  authorizeRoles("client", "developer", "qa"),
  addCommentToTicket
);

export default router;
