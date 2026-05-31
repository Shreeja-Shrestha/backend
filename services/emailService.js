const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Sanskriti Yatra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP Code",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("OTP email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = { sendOTPEmail };