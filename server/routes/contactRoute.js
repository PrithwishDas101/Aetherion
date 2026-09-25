import express from "express";

import {
  getRecentContacts,
  getContacts,
  removeContact,
  addContact,
} from "../controllers/contactController.js";

import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Profile: Returns the 5 most recently created
// contacts for the logged-in user or a requested user.
router.get("/recent", protectRoute, getRecentContacts);
// Contacts page: another user's contacts.
router.get("/user/:userId", protectRoute, getContacts);
// Contacts page: logged-in user's contacts.
router.get("/", protectRoute, getContacts);
// Add a contact relationship from both sides.
router.post("/:contactId", protectRoute, addContact);
// Remove a contact relationship from both sides.
router.delete("/:contactId", protectRoute, removeContact);

export default router;
