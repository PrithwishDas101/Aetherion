import express from "express";

import {
  getRecentContacts,
  getContacts,
  removeContact,
  addContact,
} from "../controllers/contactController.js";

import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Profile: Returns the 5 most recently created contacts.
router.get("/recent", protectRoute, getRecentContacts);
// Contacts page: Supports: ?search=user ?page=1 ?limit=50
router.get("/", protectRoute, getContacts);
// Add a contact relationship from both sides.
router.post("/:contactId", protectRoute, addContact);
// Remove a contact relationship from both sides.
router.delete("/:contactId", protectRoute, removeContact);

export default router;
