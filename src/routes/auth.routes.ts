import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeAll } from "../middlewares/authorize.middleware";

export const authRoutes = Router();

authRoutes.post("/register", AuthController.register);
authRoutes.post("/login", AuthController.login);
authRoutes.get("/current", [authMiddleware, authorizeAll], AuthController.current);