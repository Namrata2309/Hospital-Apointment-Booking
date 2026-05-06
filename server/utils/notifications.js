const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your 16-digit App Password
  },
});

const sendNotification = async (patientEmail, subject, message) => {
  try {
    await transporter.sendMail({
      from: `"SmartCare Hospital" <${process.env.EMAIL_USER}>`,
      to: patientEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0d3b6e;">SmartCare Hospital</h2>
          <p style="font-size: 16px;">${message}</p>
        </div>
      `,
    });
    console.log(`✅ Email sent successfully to ${patientEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${patientEmail}:`, error);
  }
};

module.exports = { sendNotification };