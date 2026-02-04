import express from "express";
import { Resend } from "resend";
import UserSetup from "../models/UserSetup.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// 🔐 In-memory OTP store (OK for now, Redis recommended later)
const otpStore = new Map();

// ✉️ Resend client
const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_EXPIRY = Number(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000;

// 🔢 OTP generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000);

// ============================
// SEND EMAIL OTP (REGISTER)
// ============================
router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });

    // ❌ Block if already registered
    const existingUser = await UserSetup.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "Email already registered",
        field: "email",
      });

    const otp = generateOTP();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY,
    });

    await resend.emails.send({
      from: "Resend <onboarding@resend.dev>",
      to: email,
      subject: "Servizo OTP Verification",
      html: `
        <h2>Servizo</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p><b>Do not share this OTP.</b></p>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// ============================
// VERIFY EMAIL OTP
// ============================
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

// ============================
// FORGOT PASSWORD → SEND OTP
// ============================
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

    await resend.emails.send({
      from: "Resend <onboarding@resend.dev>",
      to: email,
      subject: "Servizo Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <h1>${otp}</h1>
        <p>OTP valid for 5 minutes</p>
      `,
    });

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

// ============================
// RESET PASSWORD
// ============================
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

export default router;