import nodemailer from "nodemailer";
import { passwordResetTemplate } from "../../templates/emails/password-reset.template";
import { welcomeTemplate } from "../../templates/emails/welcome.template";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as any);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: passwordResetTemplate(fullName, resetUrl),
  });
};

export const sendWelcomeEmail = async (
  email: string,
  fullName: string,
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: "Welcome to Our App!",
    html: welcomeTemplate(fullName),
  });
};
