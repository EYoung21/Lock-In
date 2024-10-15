const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.sendVerificationCode = functions.firestore
  .document("verificationCodes/{email}")
  .onCreate(async (snap, context) => {
    const email = context.params.email;
    const data = snap.data();
    const code = data.code;

    const mailOptions = {
      from: "Your App <yourapp@example.com>",
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
      return null;
    } catch (error) {
      console.error("There was an error while sending the email:", error);
      return null;
    }
  });
