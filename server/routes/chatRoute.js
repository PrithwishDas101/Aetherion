import express from "express";

import {
    createChat,
    getAllChats,
    clearUnreadMessages
} from "../controllers/chatController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protectRoute, createChat);
router.get("/", protectRoute, getAllChats);
router.post("/clear-unread-message", protectRoute, clearUnreadMessages);


export default router;