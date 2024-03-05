export const resetEmail = (link:any, firmName:any): string => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Email</title>
        </head>
        <body style="background-color: #f4f4f4; font-family: Arial, sans-serif;">

            <!-- Logo Section -->
            <div style="text-align: center; padding: 20px;">
                <img src="https://media.licdn.com/dms/image/D4D22AQHzCBwHXAWCdQ/feedshare-shrink_800/0/1707289741759?e=1712793600&v=beta&t=FoVUilzU-j_POK1-CUXMWKc_YvXh70Gadet7E1C2K6M" alt="Company Logo" style="max-width: 200px;">
            </div>

            <!-- Company Name -->
            <h1 style="text-align: center; color: #333;">${firmName}</h1>

            <!-- Email Content -->
            <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2>Password Reset</h2>
                <p>Hello [User],</p>
                <p>You recently requested to reset your password for your ${firmName} account. Click the button below to reset your password:</p>
                <!-- Reset Button -->
                <div style="text-align: center;">
                    <a href="${link}" style="background-color: #457b9d; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p>If you did not request a password reset, please ignore this email. This password reset link is valid for the next 30 minutes.</p>
                <p>Thank you,</p>
                <p>Your PlaintiffAid Team</p>
            </div>

        </body>
        </html>
    `;
};
