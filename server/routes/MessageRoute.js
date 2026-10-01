import express from "express";

import { protectRoute } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getAllMessages,
} from "../controllers/messageController.js";
import {
  messageUpload,
  singleUpload,
  validateMessageUpload,
} from "../middleware/uploadMiddleware.js";
import {
  messageIpLimiter,
  messageUserLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/send-message",
  protectRoute,
  messageIpLimiter,
  messageUserLimiter,
  singleUpload(messageUpload, "media"),
  validateMessageUpload,
  sendMessage,
);
router.get("/:chatId", protectRoute, getAllMessages);

export default router;
