import express from "express";

import { protectRoute } from "../middleware/authMiddleware.js";
import { sendMessage, getAllMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post("/send-message", protectRoute, sendMessage);
router.get("/:chatId", protectRoute, getAllMessages);

export default router;