import { Router } from "express";
import { authRoutes } from "./auth.route";

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

export { router as routes };
