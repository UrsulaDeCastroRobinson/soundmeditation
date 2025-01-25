const nodemailer = require('nodemailer');

// Configure your email transport using Brevo (Sendinblue) SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Brevo (Sendinblue) SMTP server
    port: 587, // SMTP port
    secure: false, // Use TLS
    auth: {
        user: '84306c001@smtp-brevo.com', // Your Brevo (Sendinblue) email address
        pass: process.env.BREVO_API_KEY // Your Brevo (Sendinblue) API key
    }
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send email to yourself
    subject: 'Test Email',
    text: 'This is a test email to verify Brevo setup.'
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email:', error);
    } else {
        console.log('Email sent:', info.response);
    }
});