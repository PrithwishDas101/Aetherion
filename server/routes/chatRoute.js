import express from "express";

import { protectRoute } from "../middleware/authMiddleware.js";
import { createChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/create", protectRoute, createChat);

export default router;