import app from "./app";
import { prisma } from "./lib/prisma";
import { appLogger } from "./lib/winston";

const startServer = async () => {
  try {
    // Connect to the database
    await prisma.$connect();

    const server = app.listen(process.env.PORT, () => {
      appLogger.info(`🚀 Server is running on port ${process.env.PORT}`);
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
  } catch (error) {
    appLogger.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
