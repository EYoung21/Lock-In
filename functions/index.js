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
    console.log("Function triggered for email:", context.params.email);
    const email = context.params.email;
    const data = snap.data();
    const code = data.code;

    console.log("Verification code:", code);
    console.log("Using email configuration:", functions.config().gmail.email);

    const mailOptions = {
      from: `Your App <${functions.config().gmail.email}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
    };

    try {
      console.log("Attempting to send email...");
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully to:", email);
      return null;
    } catch (error) {
      console.error("Error sending email to", email, ":", error);
      // You might want to delete the document if email sending fails
      try {
        await snap.ref.delete();
        console.log("Deleted verification code document for", email);
      } catch (deleteError) {
        console.error(
          "Error deleting verification code document for",
          email,
          ":",
          deleteError
        );
      }
      return null;
    }
  });
