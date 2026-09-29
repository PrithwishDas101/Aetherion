import express from "express";

import { protectRoute } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getAllMessages,
} from "../controllers/messageController.js";
import { messageUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/send-message",
  protectRoute,
  messageUpload.single("media"),
  sendMessage,
);
router.get("/:chatId", protectRoute, getAllMessages);

export default router;
