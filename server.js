import dotenv from "dotenv";
dotenv.config(); 
import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import otpRoutes from "./routes/otpRoutes.js";
import registerRoutes from "./routes/auth.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api", otpRoutes);
app.use("/api", registerRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});






