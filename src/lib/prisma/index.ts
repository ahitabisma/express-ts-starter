import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../../generated/prisma/client.js";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  connectionLimit: 10,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    errorFormat: "pretty",
  });

if (process.env.APP_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
