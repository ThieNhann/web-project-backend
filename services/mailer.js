const nodemailer = require('nodemailer');

// Cấu hình transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.VITE_MAIL,
        pass: process.env.VITE_MAILTOKEN,
      },
    });

async function sendMail(to, code) {
  try {
    const mailOptions = {
      from: process.env.VITE_MAIL,
      to: to,
      subject: 'Your 2FA Code',
      html: `
        <h1>Two-Factor Authentication</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in ${process.env.TWO_FA_EXPIRES_IN ? parseInt(process.env.TWO_FA_EXPIRES_IN) / 60000 : 15} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendMail };
