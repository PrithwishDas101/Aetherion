import express from "express";

import {
    createChat,
    getAllChats
} from "../controllers/chatController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protectRoute, createChat);
router.get("/", protectRoute, getAllChats);


export default router;