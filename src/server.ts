import app from "./app";
import { prisma } from "./lib/prisma";
import { appLogger } from "./lib/winston";

const startServer = async () => {
  try {
    // Connect to the database
    await prisma.$connect();

    const server = app.listen(process.env.APP_PORT, () => {
      appLogger.info(`🚀 Server is running on port ${process.env.APP_PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      appLogger.info(`\n⚠️  ${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await prisma.$disconnect();
        appLogger.info("Database disconnected");
        appLogger.info("Server closed");
        process.exit(0);
      });
    };

    // Register signal handlers
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    appLogger.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
