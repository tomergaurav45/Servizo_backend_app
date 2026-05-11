import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();

router.post("/send-message", async (req, res) => {
  try {
    const { senderId, receiverId, message, bookingId } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "senderId, receiverId, and message are required",
      });
    }

    const chat = await Chat.create({
      senderId,
      receiverId,
      message,
      bookingId,
    });

    const io = req.app.get("io");

    if (io) {
      io.to(receiverId).emit("newMessage", chat);
      io.to(senderId).emit("newMessage", chat);
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (err) {
    console.error("Send message error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

router.get("/messages", async (req, res) => {
  try {
    const { user1, user2, bookingId } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({
        success: false,
        message: "user1 and user2 are required",
      });
    }

    const query = {
      $or: [
        {
          senderId: user1,
          receiverId: user2,
        },
        {
          senderId: user2,
          receiverId: user1,
        },
      ],

      deletedFor: {
        $ne: user1,
      },
    };

    if (bookingId) {
      query.bookingId = bookingId;
    }

    const chats = await Chat.find(query).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      data: chats,
    });
  } catch (err) {
    console.error("Get messages error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
});

router.put("/delete-messages-for-user", async (req, res) => {
  try {
    const { user1, user2, bookingId } = req.body;

    if (!user1 || !user2) {
      return res.status(400).json({
        success: false,
        message: "user1 and user2 are required",
      });
    }

    const query = {
      $or: [
        {
          senderId: user1,
          receiverId: user2,
        },
        {
          senderId: user2,
          receiverId: user1,
        },
      ],
    };

    if (bookingId) {
      query.bookingId = bookingId;
    }

    await Chat.updateMany(query, {
      $addToSet: {
        deletedFor: user1,
      },
    });

    res.json({
      success: true,
      message: "Chat deleted for this user",
    });
  } catch (err) {
    console.error("Delete messages error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete messages",
    });
  }
});

router.delete("/delete-single-message/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMessage = await Chat.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.to(deletedMessage.senderId).emit(
        "messageDeleted",
        deletedMessage._id
      );

      io.to(deletedMessage.receiverId).emit(
        "messageDeleted",
        deletedMessage._id
      );
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (err) {
    console.error("Delete single message error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
});

export default router;