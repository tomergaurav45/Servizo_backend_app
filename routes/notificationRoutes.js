import express from "express";
import Notification from "../models/notification.js";

const router = express.Router();


router.get("/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
});



router.post("/mark-read", async (req, res) => {
  try {
    const { id } = req.body;

    await Notification.findByIdAndUpdate(id, {
      isRead: true,
    });

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});


router.post("/create", async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    const notif = await Notification.create({
      userId,
      title,
      message,
      type,
    });

    res.json({ success: true, data: notif });
  } catch (err) {
    res.json({ success: false });
  }
});

router.delete("/delete-all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.deleteMany({ userId });

    res.json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (err) {
    console.log("DELETE NOTIFICATION ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete notifications",
    });
  }
});

export default router;