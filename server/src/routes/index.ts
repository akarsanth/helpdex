import express from "express";
const router = express.Router();
import userRoutes from "./user-routes";
import attachmentRoutes from "./attachment-routes";
import categoryRoutes from "./category-routes";
import statusRoutes from "./status-routes";
import ticketRoutes from "./ticket-routes";

router.use("/users", userRoutes);
router.use("/attachments", attachmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/statuses", statusRoutes);
router.use("/tickets", ticketRoutes);

export default router;
