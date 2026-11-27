import express from "express";

import { protectRoute } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getAllMessages,
  editMessage,
  deleteMessage,
  reactToMessage,
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
router.patch("/:messageId", protectRoute, messageIpLimiter, messageUserLimiter, editMessage);
router.delete("/:messageId", protectRoute, messageIpLimiter, messageUserLimiter, deleteMessage);
router.post("/:messageId/reaction", protectRoute, messageIpLimiter, messageUserLimiter, reactToMessage);
router.get("/:chatId", protectRoute, getAllMessages);

export default router;
