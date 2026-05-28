import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tomergaurav177@gmail.com",
    pass: "zorkysifqpawpgzi",
  },
});

export const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: "Servizo <tomergaurav177@gmail.com>",
      to: email,
      subject: "Servizo OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    console.log("OTP sent to:", email);
  } catch (error) {
    console.log("Mail error:", error);
    throw error;
  }
};