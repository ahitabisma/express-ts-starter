import dotenv from 'dotenv';
import logger from '../config/logger';
import fs from 'fs-extra';
import nodemailer from 'nodemailer';
import path from 'path';
import handlebars from 'handlebars';

dotenv.config();

interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

export class EmailService {
    private static transporter: nodemailer.Transporter;

    /**
     * Initialize email service with nodemailer transporter
     */
    static async init() {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT),
                secure: process.env.MAIL_SECURE === 'false' ? false : true,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD,
                },
            });

            // Verify connection
            await this.transporter.verify();
            logger.info('Email service initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize email service:', error);
            throw error;
        }
    }

    /**
     * Send email using handlebars template
     */
    static async sendEmail(options: EmailOptions): Promise<void> {
        try {
            // Load the template file
            const templatePath = path.join(process.cwd(), 'src', 'templates', `${options.template}.handlebars`);
            const source = await fs.readFile(templatePath, 'utf-8');

            // Compile the template
            const template = handlebars.compile(source);

            // Render the template with context
            const html = template(options.context);

            // Send email
            await this.transporter.sendMail({
                from: `"${process.env.MAIL_FROM_NAME || 'Test App'}" <${process.env.MAIL_FROM || 'test@example.com'}>`,
                to: options.to,
                subject: options.subject,
                html,
            });

            logger.info(`Email sent to: ${options.to}`);

        } catch (error) {
            logger.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Send password reset email with JWT token
     */
    static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        // Create reset URL with token
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

        // Get current year for the copyright in footer
        const currentYear = new Date().getFullYear();

        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            template: 'reset-password-email',
            context: {
                title: 'Password Reset Request',
                header: 'Reset Your Password',
                resetUrl,
                year: currentYear,
                appName: process.env.APP_NAME || 'Our Application',
            },
        });
    }
}