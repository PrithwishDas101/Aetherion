import express from "express";

import {
  getContactProfile,
  getContactProfileMedia,
} from "../controllers/contactProfileController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId/media", protectRoute, getContactProfileMedia);
router.get("/:userId", protectRoute, getContactProfile);

export default router;
