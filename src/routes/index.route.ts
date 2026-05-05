import { Router } from "express";
import { authRoutes } from "./auth.route";
import { userRoutes } from "./user.route";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export { router as routes };
