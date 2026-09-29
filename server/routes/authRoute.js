import express from "express";

import { signup, login, logout } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { signupUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/signup", authLimiter, signupUpload.single("profilePic"), signup);
router.post("/login", authLimiter, login);
router.post("/logout", protectRoute, logout);

export default router;
