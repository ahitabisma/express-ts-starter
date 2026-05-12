import { prisma } from "../lib/prisma";
import { AppStatus } from "../types/app.type";
import { toUserResponse } from "../types/auth.type";
import { FilteringQuery } from "../types/filter.type";
import { UpdateProfileDTO } from "../types/user.type";
import { AppError } from "../utils/app-error.util";
import { buildPrismaQuery, wrapPaginated } from "../utils/filter.util";
import {
  avatarUploadOptions,
  deleteFile,
  saveFile,
} from "../utils/upload.util";

const USER_FIELDS = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  avatar: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const ALLOWED_FIELDS = Object.keys(USER_FIELDS);

export class UserService {
  static async getProfile(userId: string) {
    const user = await findByUserId(userId);

    return toUserResponse(user);
  }

  static async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await findByUserId(userId);

    if (data.email && data.email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists && emailExists.id !== userId) {
        throw new AppError(
          "Email already in use",
          409,
          AppStatus.VALIDATION_ERROR,
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName ?? user.fullName,
        email: data.email ?? user.email,
      },
    });

    return toUserResponse(updatedUser);
  }

  static async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await findByUserId(userId);

    const oldAvatar = user.avatar;

    const saved = await saveFile(file, avatarUploadOptions, user.avatar);

    try {
      const updated = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar: saved.url,
        },
      });

      if (oldAvatar) {
        await deleteFile(oldAvatar).catch(() => {
          /* ignore */
        });
      }

      return toUserResponse(updated);
    } catch (error) {
      await deleteFile(saved.url).catch(() => {
        /* ignore */
      });

      throw error;
    }
  }

  static async deleteAvatar(userId: string) {
    const user = await findByUserId(userId);

    if (!user.avatar) {
      throw new AppError(
        "No avatar to delete",
        400,
        AppStatus.VALIDATION_ERROR,
      );
    }

    await deleteFile(user.avatar).catch(() => {
      /* ignore */
    });

    const updated = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: null,
      },
    });

    return toUserResponse(updated);
  }

  static async getAll(filter: FilteringQuery = {}) {
    const { where, orderBy, skip, take, page, limit } = buildPrismaQuery(
      filter,
      ALLOWED_FIELDS,
      { updatedAt: "desc" },
    );

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
        select: USER_FIELDS,
      }),
      prisma.user.count({ where }),
    ]);

    const { data, pagination } = wrapPaginated(users, total, page, limit);

    return { data, pagination };
  }

  static async getById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_FIELDS,
    });

    if (!user) {
      throw new AppError("User not found", 404, AppStatus.NOT_FOUND);
    }

    return user;
  }
}

// PRIVATE HELPER FUNCTIONS
async function findByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404, AppStatus.NOT_FOUND);
  }

  return user;
}
