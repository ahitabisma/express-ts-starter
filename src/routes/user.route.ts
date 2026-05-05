import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.use(authenticate);

router.use("/me", UserController.getProfile);

// ADMIN MIDDLEWARE
router.use(authorize(Role.ADMIN));

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
// router.post("/", UserController.create);
// router.put("/:id", UserController.update);
// router.delete("/:id", UserController.delete);

export { router as userRoutes };
