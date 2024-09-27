const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // ? 1) Create a transporter
  const transporter = nodemailer.createTransport({
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // ? 2) Define the email options
  const mailOptions = {
    from: 'Mohammed Saber <admin@natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // ? 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
