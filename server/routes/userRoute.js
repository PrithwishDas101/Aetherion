import express from "express";

import { protectRoute } from "../middleware/authMiddleware.js";
import { getLoggedUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/get-logged-user", protectRoute, getLoggedUser);

export default router;