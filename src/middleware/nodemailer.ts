import nodemailer from "nodemailer"
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// Define an interface for the email options
interface EmailOptions {
    email: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: EmailOptions) => {
    try {
        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.SECRET_KEY
            }
        });

        // Define mail options
        let mailOptions = {
            from: process.env.EMAIL,
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

