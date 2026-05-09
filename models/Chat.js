import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    bookingId: { type: String }, 
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);