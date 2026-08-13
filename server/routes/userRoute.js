import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import { getLoggedUser, getAllUsers, updateProfilePicture } from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { profilePictureLimiter, } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/get-logged-user", protectRoute, getLoggedUser);
router.get("/get-all-users", protectRoute, getAllUsers);
router.post("/profile-picture", profilePictureLimiter, protectRoute, upload.single("profilePic"), updateProfilePicture);

export default router;