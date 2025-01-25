const nodemailer = require('nodemailer');

// Configure your email transport using Brevo (formerly Sendinblue) SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Brevo (Sendinblue) SMTP server
    port: 587, // SMTP port
    secure: false, // Use TLS
    auth: {
        user: '84306c001@smtp-brevo.com', // Your Brevo (Sendinblue) email address
        pass: process.env.BREVO_API_KEY // Your Brevo (Sendinblue) API key
    }
});

// Function to send an email
const sendEmail = (attendees, eventDetails, eventDate) => {
    const attendeeList = attendees.map(attendee => `${attendee.name} (${attendee.instrument})`).join(', ');

    const mailOptions = {
        from: process.env.EMAIL_USER, // Your verified sender email address
        to: attendees.map(attendee => attendee.email).join(', '), // Send email to all attendees
        subject: 'Event Full: Confirmation Details',
        text: `
            Dear Attendee,

            The event is now full. Here are the details:

            Event Date: ${eventDate}
            Address: ${eventDetails.address}
            Attendees: ${attendeeList}

            Thank you for registering!

            Best regards,
            Event Team
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = sendEmail;