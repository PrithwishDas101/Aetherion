import express from "express";
import {
  profileBannerUpload,
  profilePictureUpload,
  singleUpload,
  validateProfileImageUpload,
} from "../middleware/uploadMiddleware.js";

import {
  getLoggedUser,
  getAllUsers,
  updateProfilePicture,
  removeProfilePicture,
  updatePersonalProfile,
  updateProfileBanner,
  updateConnections,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  profilePictureLimiter,
  removeProfilePictureLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/get-logged-user", protectRoute, getLoggedUser);
router.get("/get-all-users", protectRoute, getAllUsers);
router.put("/profile", protectRoute, updatePersonalProfile);
router.post(
  "/profile-picture",
  profilePictureLimiter,
  protectRoute,
  singleUpload(profilePictureUpload, "profilePic"),
  validateProfileImageUpload,
  updateProfilePicture,
);
router.delete(
  "/remove-profile-picture",
  protectRoute,
  removeProfilePictureLimiter,
  removeProfilePicture,
);
router.post(
  "/profile-banner",
  profilePictureLimiter,
  protectRoute,
  singleUpload(profileBannerUpload, "profileBanner"),
  validateProfileImageUpload,
  updateProfileBanner,
);
router.put("/connections", protectRoute, updateConnections);

export default router;
