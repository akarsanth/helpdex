import express from "express";
const router = express.Router();
import userRoutes from "./user-routes";
import attachmentRoutes from "./attachment-routes";
import categoryRoutes from "./category-routes";
import ticketRoutes from "./ticket-routes";
import commentRoutes from "./comment-routes";

router.use("/users", userRoutes);
router.use("/attachments", attachmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/tickets", ticketRoutes);
router.use("/comments", commentRoutes);

export default router;
