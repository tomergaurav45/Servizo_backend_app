import express from "express";
import bcrypt from "bcryptjs";
import UserSetup from "../models/UserSetup.js";

const router = express.Router();

router.post("/change-password", async (req, res) => {
    try {
        const { userId, currentPassword, newPassword, confirmPassword } = req.body;


        if (!userId || !currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const user = await UserSetup.findOne({ userId }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (err) {
        console.error("Change Password Error:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
export default router;