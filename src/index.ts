import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import logger from './config/logger';
import { userRoutes } from './routes/user.routes';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// Folder for static files photo profile users
app.use('/photo', express.static('public/photo'));

// Routes
app.use('/api', authRoutes);

// Admin routes
app.use('/api/admin', userRoutes);

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    logger.info(`Server running at http://localhost:${process.env.PORT}`);
});