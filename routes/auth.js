import express from "express";
import bcrypt from "bcryptjs";
import UserSetup from "../models/UserSetup.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await UserSetup.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
        field: "email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserSetup({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
        field: "email",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    
    const user = await UserSetup.findOne({ email }).select("+password");

    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Wrong email",
        field: "email",
      });
    }

    

    const isMatch = await bcrypt.compare(password, user.password);

   
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong password",
        field: "password",
      });
    }

    
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



export default router;
