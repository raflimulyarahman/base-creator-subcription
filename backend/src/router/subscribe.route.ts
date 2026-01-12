import { Router } from "express";
import * as subscibeController from "../controllers/subscribe.controllers";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";
const router = Router();

router.get("/", verifyToken, checkRole(["Creators","Users"]), subscibeController.getSubscribe);
router.post("/", verifyToken, checkRole(["Creators","Users"]), subscibeController.createSubscribe);
export default router;
