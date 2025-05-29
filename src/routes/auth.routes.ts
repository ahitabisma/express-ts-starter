import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeAll } from "../middlewares/authorize.middleware";
import { uploadPhoto } from "../middlewares/upload.middleware";

export const authRoutes = Router();

authRoutes.post("/register", AuthController.register);
authRoutes.post("/login", AuthController.login);
authRoutes.get("/current", [authMiddleware, authorizeAll], AuthController.current);
authRoutes.post("/logout", [authMiddleware], AuthController.logout);
authRoutes.get("/refresh", AuthController.refreshToken);
authRoutes.put("/update-profile", [authMiddleware, uploadPhoto], AuthController.updateProfile);
authRoutes.post("/send-reset-password-email", AuthController.sendResetPasswordEmail);
authRoutes.post("/reset-password", AuthController.resetPassword);