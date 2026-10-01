import express from "express";

import {
  createPoll,
  getPoll,
  voteOnPoll,
} from "../controllers/pollController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  pollCreationUserLimiter,
  pollVoteUserLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

// CREATE POLL
router.post("/", protectRoute, pollCreationUserLimiter, createPoll);
// GET POLL
router.get("/:pollId", protectRoute, getPoll);
// VOTE ON POLL
router.put("/:pollId/vote", protectRoute, pollVoteUserLimiter, voteOnPoll);

export default router;
