import { Router } from "express";
import { AuthController } from "../controller/auth.controller";

const router = Router();

router.use("/register", AuthController.register);

export { router as authRoutes };
