import express from "express";
import UserSetup from "../models/UserSetup.js";
import bcrypt from "bcryptjs";
import { sendOTP } from "./sendMail.js";
import nodemailer from "nodemailer";

const router = express.Router();

 const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "tomergaurav177@gmail.com",
    pass: "zorkysifqpawpgzi",
  },
});


const otpStore = new Map();

const OTP_EXPIRY = Number(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000;


const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000);


const sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: "Servizo <tomergaurav177@gmail.com>",
      to: email,
      subject: "Welcome to Servizo",
      html: `
        <h2>Welcome ${name} </h2>
        <p>Thanks for joining Servizo</p>
      `,
    });

    console.log("Welcome email sent:", email);
  } catch (error) {
    console.error("Welcome email failed:", error);
  }
};


router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await UserSetup.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered",
      });
    }

    const otp = generateOTP();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY,
    });

    await sendOTP(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("SEND OTP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});


router.post("/verify-email-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });

  const data = otpStore.get(email);

  if (!data)
    return res.status(400).json({
      success: false,
      message: "OTP not found. Please resend OTP.",
    });

  if (Date.now() > data.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({
      success: false,
      message: "OTP expired. Please resend OTP.",
    });
  }

  if (Number(otp) !== data.otp)
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });

  otpStore.delete(email);

  res.json({
    success: true,
    message: "OTP verified successfully",
  });
});

router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });

    const user = await UserSetup.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Email not registered",
      });

    const otp = generateOTP();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY,
    });

    await sendOTP(email, otp);

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});


router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });

    const user = await UserSetup.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});


router.post("/send-welcome-mail", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required",
      });
    }

    await sendWelcomeEmail(email, name);

    res.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send welcome email",
    });
  }
});

export default router;