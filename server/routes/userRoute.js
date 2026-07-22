import express from "express";

import {
    getLoggedUser,
    getAllUsers,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get-logged-user", protectRoute, getLoggedUser);
router.get("/get-all-users", protectRoute, getAllUsers);

export default router;