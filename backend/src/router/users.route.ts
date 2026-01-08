import { Router } from "express";
import * as userController from "../controllers/users.controllers";
import { checkRole } from "../middleware/verify.roles";
import { verifyToken } from "../middleware/verify.token";
const router = Router();

router.get("/", verifyToken, checkRole(["Admin","Users"]), userController.getUser);
router.post("/", verifyToken, checkRole(["Admin","Users"]), userController.createUser);
router.get("/:id", verifyToken, checkRole(["Admin","Users"]), userController.getUserId);
router.put("/:id", verifyToken, checkRole(["Admin","Users"]), userController.updateUser);

export default router;
