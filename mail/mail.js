const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(email, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    transporter.verify((err, success) => {
      if (err) {
        console.log(er);
      } else {
        console.log("ready to send email");
      }
    });

    await transporter.sendMail({
      from: "chat@chat.example",
      to: email,
      subject: subject,
      text: text,
    });
  } catch (er) {
    console.log(er);
  }
}

module.exports = {sendEmail}