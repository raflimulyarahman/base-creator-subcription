import { Router } from "express";
import * as subscibeController from "../controllers/subscribe.controllers";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";
const router = Router();

router.get("/", verifyToken, checkRole(["Admin","Users"]), subscibeController.getSubscribe);
router.post("/", verifyToken, checkRole(["Admin","Users"]), subscibeController.createSubscribe);
export default router;
