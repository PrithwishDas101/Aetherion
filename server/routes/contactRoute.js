import express from "express";

import {
  getRecentContacts,
  getContacts,
  removeContact,
} from "../controllers/contactController.js";

import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Profile: Returns the 5 most recently created contacts.
router.get("/recent", protectRoute, getRecentContacts);
// Contacts page: Supports: ?search=user ?page=1 ?limit=50
router.get("/", protectRoute, getContacts);
// Remove a contact relationship. This removes the relationship from BOTH users. It does NOT delete the chat.
router.delete("/:contactId", protectRoute, removeContact);

export default router;
