import express from "express";

import {
  getRecentContacts,
  getContacts,
  removeContact,
} from "../controllers/contactController.js";

import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/recent", protectRoute, getRecentContacts);

router.get("/user/:userId", protectRoute, getContacts);

router.get("/", protectRoute, getContacts);

router.delete("/:contactId", protectRoute, removeContact);

export default router;
