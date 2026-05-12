import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Role } from "../../generated/prisma/enums";
import { avatarUploader } from "../utils/upload.util";

const router = Router();

router.use(authenticate);

router.get("/me", UserController.getProfile);
router.put("/me", UserController.updateProfile);
router.post(
  "/me/avatar",
  avatarUploader.single("avatar"),
  UserController.uploadAvatar,
);
router.delete("/me/avatar", UserController.deleteAvatar);

// ADMIN MIDDLEWARE
router.use(authorize(Role.ADMIN));

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
// router.post("/", UserController.create);
// router.put("/:id", UserController.update);
// router.delete("/:id", UserController.delete);

export { router as userRoutes };
