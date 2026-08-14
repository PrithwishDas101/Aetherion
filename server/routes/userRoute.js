import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
  getLoggedUser,
  getAllUsers,
  updateProfilePicture,
  removeProfilePicture,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  profilePictureLimiter,
  removeProfilePictureLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/get-logged-user", protectRoute, getLoggedUser);
router.get("/get-all-users", protectRoute, getAllUsers);
router.post(
  "/profile-picture",
  profilePictureLimiter,
  protectRoute,
  upload.single("profilePic"),
  updateProfilePicture,
);
router.delete(
  "/remove-profile-picture",
  protectRoute,
  removeProfilePictureLimiter,
  removeProfilePicture,
);

export default router;
