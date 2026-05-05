import { prisma } from "../lib/prisma";
import { AppStatus } from "../types/app.type";
import { toUserResponse } from "../types/auth.type";
import { FilteringQuery } from "../types/filter.type";
import { AppError } from "../utils/app-error.util";
import { buildPrismaQuery, wrapPaginated } from "../utils/filter.util";

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404, AppStatus.NOT_FOUND);
    }

    return toUserResponse(user);
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
