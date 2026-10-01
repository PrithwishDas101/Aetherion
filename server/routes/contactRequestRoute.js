import express from "express";

import {
  sendContactRequest,
  getIncomingContactRequests,
  getOutgoingContactRequests,
  getContactRequestCount,
  acceptContactRequest,
  declineContactRequest,
  cancelContactRequest,
} from "../controllers/contactRequestController.js";

import { protectRoute } from "../middleware/authMiddleware.js";
import { contactRequestUserLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/count", protectRoute, getContactRequestCount);
router.get("/incoming", protectRoute, getIncomingContactRequests);
router.get("/outgoing", protectRoute, getOutgoingContactRequests);
router.post(
  "/:recipientId",
  protectRoute,
  contactRequestUserLimiter,
  sendContactRequest,
);
router.post("/:requestId/accept", protectRoute, acceptContactRequest);
router.post("/:requestId/decline", protectRoute, declineContactRequest);
router.delete("/:requestId", protectRoute, cancelContactRequest);

export default router;
