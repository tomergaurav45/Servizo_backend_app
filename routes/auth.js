import express from "express";
import bcrypt from "bcryptjs";
import UserSetup from "../models/UserSetup.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      password,
      role,
      phone,
      dob,
      gender,
      skills,
      experience,
      availability,
    } = req.body;


    if (userId) {

      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (phone !== undefined) updateData.phone = phone;
      if (dob !== undefined) updateData.dob = dob;
      if (gender !== undefined) updateData.gender = gender;

      if (Array.isArray(skills)) updateData.skills = skills;

      if (experience !== undefined) updateData.experience = experience;
      if (availability !== undefined) updateData.availability = availability;

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }
      const updatedUser = await UserSetup.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    }


    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
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
      role,
      phone,
      dob,
      gender,
      skills,
      experience,
      availability,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
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
        message: "User with this Email not exist please Register",
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
        role: user.role,
        skills: user.skills,
        availability: user.availability,
        dob: user.dob,
        experience: user.experience,
        gender: user.gender,
        phone: user.phone
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
