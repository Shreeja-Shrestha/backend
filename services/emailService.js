const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    const result = await resend.emails.send({
      from: "Sanskriti Yatra <onboarding@resend.dev>",
      to: email,
      subject: "Your Password Reset OTP Code",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("OTP email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = { sendOTPEmail };