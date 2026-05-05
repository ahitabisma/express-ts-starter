import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.use("/register", authRateLimiter, AuthController.register);
router.use("/login", authRateLimiter, AuthController.login);

router.use("/refresh", AuthController.refreshToken);
router.use("/logout", AuthController.logout);

export { router as authRoutes };
