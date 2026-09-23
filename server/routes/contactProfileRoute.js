import express from "express";

import { getContactProfile } from "../controllers/contactProfileController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protectRoute, getContactProfile);

export default router;
