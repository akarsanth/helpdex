import express from "express";
const router = express.Router();
import userRoutes from "./user-routes";
import attachmentRoutes from "./attachment-routes";

router.use("/users", userRoutes);
router.use("/attachments", attachmentRoutes);

export default router;
