import express from "express";
import Booking from "../models/BookingDetails.js";

const router = express.Router();


router.post("/create-booking", async (req, res) => {
  try {
    const {
      userId,
      serviceName,
      subService,
      description,
      notes,
      address,
      providerId,
    } = req.body;

    if (!userId || !serviceName || !subService || !description || !address) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }


    const lastBooking = await Booking.findOne().sort({ createdAt: -1 });

    let nextId = 1;
    if (lastBooking && lastBooking.bookingId) {
      const lastNumber = parseInt(lastBooking.bookingId.replace("BK", ""));
      nextId = lastNumber + 1;
    }

    const bookingId = `BK${String(nextId).padStart(4, "0")}`;


    const newBooking = new Booking({
      bookingId,
      userId,
      serviceName,
      subService,
      description,
      notes,
      address,
      status: providerId ? "ASSIGNED" : "OPEN",
      providerId: providerId || null,
    });

    await newBooking.save();

    return res.status(201).json({
      success: true,
      message: providerId
        ? "Booking created and assigned to provider"
        : "Booking created successfully",
      data: newBooking,
    });

  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;