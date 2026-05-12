export const passwordResetTemplate = (
  fullName: string,
  resetUrl: string,
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Password Reset</title>
    </head>

    <body
      style="
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        padding: 40px 20px;
      "
    >
      <div
        style="
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
        "
      >
        <h2 style="color: #111827; margin-bottom: 20px;">
          Password Reset Request
        </h2>

        <p style="color: #374151;">
          Hi <strong>${fullName}</strong>,
        </p>

        <p style="color: #374151; line-height: 1.6;">
          We received a request to reset your password.
          Click the button below to continue.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              background-color: #4F46E5;
              color: #ffffff;
              padding: 14px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
            "
          >
            Reset Password
          </a>
        </div>

        <p style="color: #374151;">
          This link will expire in <strong>1 hour</strong>.
        </p>

        <p style="color: #374151;">
          If you didn't request this, you can safely ignore this email.
        </p>

        <hr
          style="
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 32px 0;
          "
        />

        <p
          style="
            color: #9CA3AF;
            font-size: 12px;
            line-height: 1.5;
          "
        >
          For security reasons, never share this email or link with anyone.
        </p>
      </div>
    </body>
    </html>
  `;
};
