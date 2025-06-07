// index.js (or app.js) - Your Main Backend Application File

// Load environment variables from .env file at the very top
require('dotenv').config();

const express = require('express');
const { Resend } = require('resend'); // Import the Resend library
const cors = require('cors'); // Import CORS middleware

const app = express();
const port = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

// --- Middleware ---

// Enable CORS (Cross-Origin Resource Sharing)
// IMPORTANT: For production, replace '*' with your actual Vercel frontend URL
// e.g., origin: 'https://your-vercel-frontend-domain.vercel.app'
app.use(cors({ origin: ['https://portfolio-git-main-heets-projects-3796b335.vercel.app',
'https://portfolio-201mykp7r-heets-projects-3796b335.vercel.app'] }));
// Or for multiple domains:
// app.use(cors({ origin: ['https://your-vercel-frontend-domain.vercel.app', 'https://your-custom-domain.com'] }));
// Parse JSON request bodies
app.use(express.json());

// --- Routes ---

// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).send('Render Backend is running and healthy!');
});

// Original POST /api/contact Endpoint (KEPT AS IS)
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields (name, email, message) are required.' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Ensure this is your VERIFIED Resend domain email!
            to: 'heetchovatiya711@gmail.com', // Your personal email
            subject: `New Contact Form Submission from: ${name}`,
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
            reply_to: email
        });

        if (error) {
            console.error('Error sending email via Resend:', error);
            return res.status(500).json({ error: 'Failed to send email.', details: error.message });
        }

        console.log('Email sent successfully:', data);
        res.status(200).json({ message: 'Email sent successfully! Thank you for your message.' });

    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
});


// --- NEW POST /api/chatbot-email Endpoint ---
// This endpoint handles submissions specifically from your chatbot's contact form.
app.post('/api/chatbot-email', async (req, res) => {
    // Destructure all expected fields from the frontend's chatbot form
    const { name, email, project, userQuery, botResponse } = req.body;

    // Server-Side Validation: Ensure required fields are present for this form
    if (!name || !email || !project) {
        return res.status(400).json({ error: 'Name, email, and project overview are required.' });
    }

    try {
        const { data, error } = await resend.emails.send({
            // 'from' MUST be a verified domain/email in your Resend account.
            // This is critical for emails to send successfully.
            from: 'onboarding@resend.dev', // <-- CHANGE THIS to your VERIFIED Resend email!
                                            // You might even use a different 'from' email if you want to distinguish
                                            // chatbot emails from general contact form emails.

            // 'to' is the recipient email address - this should be YOUR personal email inbox.
            to: 'heetchovatiya711@gmail.com', // <-- CONFIRM THIS IS YOUR DESIRED RECIPIENT

            // Subject of the email for easy identification in your inbox
            subject: `New Chatbot Inquiry from: ${name}`, // Clear subject for chatbot submissions

            // HTML content for the email body.
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>New Chatbot Project Inquiry</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
                        .header { background-color: #4F46E5; /* Indigo/Purple from your chatbot design */ color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px 0; }
                        .field { margin-bottom: 15px; }
                        .field strong { display: block; margin-bottom: 5px; color: #555; }
                        .message-box { background-color: #f0f0f0; border-left: 4px solid #4F46E5; padding: 15px; margin-top: 10px; border-radius: 4px; }
                        .context-box { background-color: #e6f7ff; border-left: 4px solid #007bff; padding: 15px; margin-top: 10px; border-radius: 4px; font-size: 0.9em; }
                        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>&#128187; New Project Inquiry via Chatbot!</h2>
                        </div>
                        <div class="content">
                            <p>You have received a new project inquiry through your portfolio's AI chatbot.</p>
                            <div class="field">
                                <strong>Name:</strong>
                                <p>${name}</p>
                            </div>
                            <div class="field">
                                <strong>Email:</strong>
                                <p><a href="mailto:${email}">${email}</a></p>
                            </div>
                            <div class="field">
                                <strong>Project Overview:</strong>
                                <div class="message-box">
                                    <p>${project}</p>
                                </div>
                            </div>
                            ${userQuery ? `
                            <div class="field">
                                <strong>Last User Query (from chat):</strong>
                                <div class="context-box">
                                    <p>${userQuery}</p>
                                </div>
                            </div>
                            ` : ''}
                            ${botResponse ? `
                            <div class="field">
                                <strong>Last Bot Response (from chat):</strong>
                                <div class="context-box">
                                    <p>${botResponse}</p>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        <div class="footer">
                            <p>This inquiry was sent via your portfolio's AI chatbot.</p>
                            <p>&copy; ${new Date().getFullYear()} Your Portfolio Name. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            reply_to: email
        });

        if (error) {
            console.error('Error sending email via Resend:', error);
            return res.status(500).json({ error: 'Failed to send email.', details: error.message });
        }

        console.log('Chatbot email sent successfully:', data);
        res.status(200).json({ message: 'Chatbot email sent successfully! Thank you for your message.' });

    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
});


// --- Start the Server ---
app.listen(port, () => {
    console.log(`Render Backend listening at http://localhost:${port}`);
    console.log(`Open your browser to http://localhost:${port} to see the health check.`);
    console.log(`POST to http://localhost:${port}/api/contact with JSON body for testing.`);
    console.log(`POST to http://localhost:${port}/api/chatbot-email for chatbot form testing.`);
});