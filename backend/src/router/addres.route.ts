import { Router } from "express";
import * as addresController from "../controllers/addres.controllers";

const router = Router();

router.post("/", addresController.createAddress);

export default router;
