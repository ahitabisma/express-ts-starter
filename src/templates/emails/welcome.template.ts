export const welcomeTemplate = (fullName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Welcome</title>
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
        <h2 style="color: #4F46E5;">
          Welcome, ${fullName}! 🎉
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          Your account has been created successfully.
        </p>

        <p style="color: #374151; line-height: 1.6;">
          You can now login and start using our app.
        </p>
      </div>
    </body>
    </html>
  `;
};