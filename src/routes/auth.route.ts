import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", authRateLimiter, AuthController.register);
router.post("/login", authRateLimiter, AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/forgot-password", authRateLimiter, AuthController.forgotPassword);
router.post("/reset-password", authRateLimiter, AuthController.resetPassword);

router.use(authenticate);

router.post("/logout", AuthController.logout);
router.post("/change-password", AuthController.changePassword);


export { router as authRoutes };
