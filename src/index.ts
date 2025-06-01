import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { authRoutes } from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import logger from './config/logger';
import { userRoutes } from './routes/user.routes';
import cors from 'cors';
import morgan from 'morgan';
import { EmailService } from './services/email.service';
import { apiLimiter } from './middlewares/rate-limit.middleware';

dotenv.config();

const app = express();

app.set('trust proxy', true);

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Folder for static files
app.use('/photo', express.static('public/photo'));

// Rate Limit Middleware
app.use('/api', apiLimiter);

// Routes
app.use('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is healthy', 
        data: {
            "ip_address": req.ip
        }
    });
});
app.use('/api', authRoutes);
app.use('/api/admin', userRoutes);

app.use(errorMiddleware);

(async () => {
    try {
        await EmailService.init();

        const port = Number(process.env.PORT) || 3000;
        app.listen(port, () => {
            logger.info(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
})();
