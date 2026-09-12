import express from "express";

import {
  createPoll,
  getPoll,
  voteOnPoll,
} from "../controllers/pollController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE POLL
router.post("/", protectRoute, createPoll);
// GET POLL
router.get("/:pollId", protectRoute, getPoll);
// VOTE ON POLL
router.put("/:pollId/vote", protectRoute, voteOnPoll);

export default router;
