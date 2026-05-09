import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalRateLimiter } from "./middlewares/rate-limit.middleware";
import { routes } from "./routes/index.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import path from "path";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(globalRateLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser(process.env.COOKIE_SECRET));

// Static files
app.use("/upload", express.static(path.join(process.cwd(), "public", "upload")));

app.use("/", routes);

app.use(errorMiddleware);

export default app;
