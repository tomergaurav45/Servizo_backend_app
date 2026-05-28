import dotenv from "dotenv";
dotenv.config();
import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import otpRoutes from "./routes/otpRoutes.js";
import registerRoutes from "./routes/auth.js";
import saveadresses from "./routes/addressRoutes.js"
import changePassword from "./routes/changePasswordRoutes.js"
import createIssue from "./routes/issueRoutes.js"
import allServices from "./routes/serviceRoutes.js"
import createBooking from "./routes/bookingDetailRoutes.js"
import providerrequest from "./routes/requestRoutes.js"
import reviews from "./routes/reviewRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import Chat from "./models/Chat.js";
import serviceVariants from "./routes/serviceVariantsRoutes.js";

const app = express();
const PORT = 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`User ${userId} joined chat room`);
  });

  socket.on("sendMessage", async (data, callback) => {
    try {
      const { senderId, receiverId, message, bookingId } = data || {};

      if (!senderId || !receiverId || !message) {
        const response = {
          success: false,
          message: "senderId, receiverId, and message are required",
        };
        if (callback) callback(response);
        return;
      }

      const chat = await Chat.create({ senderId, receiverId, message, bookingId });

      io.to(receiverId).emit("newMessage", chat);
      io.to(senderId).emit("newMessage", chat);

      if (callback) callback({ success: true, data: chat });
    } catch (err) {
      console.error("Socket sendMessage error:", err);
      if (callback) callback({ success: false, message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use("/api", otpRoutes);
app.use("/api", registerRoutes);
app.use("/api", saveadresses);
app.use("/api", changePassword);
app.use("/api", createIssue);
app.use("/api", createBooking);
app.use("/api", allServices);
app.use("/api", providerrequest);
app.use("/api", reviews);
app.use("/api", notificationRoutes);
app.use("/api", chatRoutes);
app.use("/api", serviceVariants);


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});






