const nodemailer = require('nodemailer');

// Configure your email transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password
    }
});

// Function to send email
const sendEmail = (attendees, eventDetails, eventDate) => {
    const attendeeList = attendees.map(attendee => `${attendee.name} (${attendee.instrument})`).join(', ');

    const mailOptions = {
        from: process.env.EMAIL_USER,
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