const nodemailer = require("nodemailer");
const { config } = require("../../config/config");
const ejs = require("ejs");
const path = require("path");

const sendEmail = async (
  email,
  subject,
  content,
  companyName,
  username,
  title,
  buttonContent,
  resetUrl
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.HOST,
      service: config.SERVICE,
      port: config.MAIL_PORT,
      secure: true,
      auth: {
        user: config.EMAIL_ADDRESS,
        pass: config.USER_PASSWORD,
      },
    });

    ejs.renderFile(
      path.join(__dirname, "..", "../views/email.ejs"),
      {
        email,
        subject,
        content,
        companyName,
        username,
        title,
        buttonContent,
        resetUrl,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mailOptions = {
            from: config.EMAIL_ADDRESS,
            to: email,
            subject: subject,
            html: data,
          };
          transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
              console.log(err);
            }
            console.log("Email send successful. ", data.messageId);
          });
        }
      }
    );
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = sendEmail;
