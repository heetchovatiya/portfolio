// index.js (or app.js) - Your Main Backend Application File

// Load environment variables from .env file at the very top
require('dotenv').config();

const express = require('express');
const { Resend } = require('resend'); // Import the Resend library
const cors = require('cors'); // Import CORS middleware

const app = express();
// Render automatically provides the PORT environment variable.
// If running locally, it will default to 3000.
const port = process.env.PORT || 3000;

// Initialize Resend with your API key.
// The API key is securely loaded from environment variables (process.env.RESEND_API_KEY).
// This variable will be set on Render and read from .env locally.
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Middleware ---

// Enable CORS (Cross-Origin Resource Sharing)
// This is crucial to allow your frontend (on Vercel) to make requests to this backend (on Render).
// For production, consider restricting origins to your specific Vercel frontend URL:
// app.use(cors({ origin: 'https://your-vercel-frontend-url.vercel.app' }));
app.use(cors());

// Parse JSON request bodies (e.g., data sent from your contact form)
app.use(express.json());

// --- Routes ---

// Health Check Endpoint
// This is a simple GET endpoint that Render often uses to check if your service is running.
// Browsers can also hit this directly to verify the backend is active.
app.get('/', (req, res) => {
    res.status(200).send('Render Backend is running and healthy!');
});

// POST /api/contact Endpoint
// This endpoint handles submissions from your contact form.
app.post('/api/contact', async (req, res) => {
    // Destructure the data sent from the frontend's contact form
    const { name, email, message } = req.body;

    // Basic Server-Side Validation: Ensure required fields are present
    if (!name || !email || !message) {
        // Return a 400 Bad Request if any required field is missing
        return res.status(400).json({ error: 'All fields (name, email, message) are required.' });
    }

    try {
        // Use the Resend API to send the email
        const { data, error } = await resend.emails.send({
            // 'from' MUST be a verified domain in your Resend account.
            // Replace 'onboarding@your-verified-domain.com' with the email address
            // from your domain that you verified in Resend (e.g., contact@yourdomain.com).
            from: 'onboarding@resend.dev',

            // 'to' is the recipient email address - this should be YOUR personal email inbox.
            // Replace 'your-personal-email@example.com' with your actual email.
            to: 'heetchovatiya711@gmail.com',

            // Subject of the email for easy identification in your inbox
            subject: `New Contact Form Submission from: ${name}`,

            // HTML content for the email body.
            // This structure makes the received email clear and easy to read.
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>New Contact Form Submission</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
                        .header { background-color: #6a0dad; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px 0; }
                        .field { margin-bottom: 15px; }
                        .field strong { display: block; margin-bottom: 5px; color: #555; }
                        .message-box { background-color: #f0f0f0; border-left: 4px solid #6a0dad; padding: 15px; margin-top: 10px; border-radius: 4px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>&#128231; New Contact from Your Portfolio!</h2>
                        </div>
                        <div class="content">
                            <p>You have received a new message from your portfolio's contact form.</p>
                            <div class="field">
                                <strong>Name:</strong>
                                <p>${name}</p>
                            </div>
                            <div class="field">
                                <strong>Email:</strong>
                                <p><a href="mailto:${email}">${email}</a></p>
                            </div>
                            <div class="field">
                                <strong>Message:</strong>
                                <div class="message-box">
                                    <p>${message}</p>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This message was sent via your portfolio contact form.</p>
                            <p>&copy; ${new Date().getFullYear()} Your Portfolio Name. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            // Optional: Set reply_to so you can directly reply to the sender's email
            reply_to: email
        });

        // Check for errors from the Resend API call
        if (error) {
            console.error('Error sending email via Resend:', error);
            // Return a 500 Internal Server Error if Resend reports an issue
            return res.status(500).json({ error: 'Failed to send email.', details: error.message });
        }

        // Log success and return a 200 OK response to the frontend
        console.log('Email sent successfully:', data);
        res.status(200).json({ message: 'Email sent successfully! Thank you for your message.' });

    } catch (err) {
        // Catch any unexpected server-side errors
        console.error('Internal server error:', err);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
});

// --- Start the Server ---

// Listen for incoming requests on the specified port
app.listen(port, () => {
    console.log(`Render Backend listening at http://localhost:${port}`);
    console.log(`Open your browser to http://localhost:${port} to see the health check.`);
    console.log(`POST to http://localhost:${port}/api/contact with JSON body for testing.`);
});