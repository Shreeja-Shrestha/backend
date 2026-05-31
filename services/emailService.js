const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Railway to use IPv4 instead of IPv6
dns.setDefaultResultOrder("ipv4first");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const sendOTPEmail = async (email, otp) => {
  try {
    console.log("Sending OTP to:", email);

    const info = await transporter.sendMail({
      from: `"Sanskriti Yatra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP Code",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = { sendOTPEmail };