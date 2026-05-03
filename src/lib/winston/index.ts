import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const baseFormat = (moduleName: string) =>
  format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${moduleName}] ${level}: ${message}`;
    }),
  );

export const createModuleLogger = (moduleName: string) => {
  return createLogger({
    level: "info",
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize({ all: true }),
          baseFormat(moduleName),
        ),
      }),
      //   new transports.File({
      //     filename: "logs/main.log",
      //     format: baseFormat(moduleName),
      //     maxsize: 52428800,
      //     maxFiles: 10,
      //   }),
      new (transports as any).DailyRotateFile({
        filename: `logs/%DATE%-${moduleName}.log`,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        format: baseFormat(moduleName),
      }),
    ],
  });
};

export const appLogger = createModuleLogger("app");
