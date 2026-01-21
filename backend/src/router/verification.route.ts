import { Router } from "express";
import {
  verifyFollowers,
  getFollowerCount,
} from "../controllers/verification.controllers";

const router = Router();

// POST /api/verify-followers - Generate signed proof for 10k+ followers
router.post("/", verifyFollowers);

// GET /api/verify-followers/:fid - Check follower count (public info)
router.get("/:fid", getFollowerCount);

export default router;
