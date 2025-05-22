import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import logger from './config/logger';
import { userRoutes } from './routes/user.routes';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();

const morganStream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

app.use(morgan('dev', { stream: morganStream }));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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