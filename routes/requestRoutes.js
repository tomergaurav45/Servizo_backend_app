import express from "express";
import Booking from "../models/BookingDetails.js";
import UserSetup from "../models/UserSetup.js";
import UserAddress from "../models/UserAddress.js";

const router = express.Router();

router.post("/accept", async (req, res) => {
  try {
    const { bookingId, providerId } = req.body;

    if (!bookingId || !providerId) {
      return res.json({
        success: false,
        message: "bookingId and providerId required",
      });
    }

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

   
    if (booking.status !== "OPEN") {
      return res.json({
        success: false,
        message: "Already accepted by another provider",
      });
    }
    booking.status = "ASSIGNED";
    booking.providerId = providerId;

    await booking.save();

    res.json({
      success: true,
      message: "Job accepted",
      data: booking,
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/provider-requests", async (req, res) => {
  try {
    const { providerId } = req.query;

    if (!providerId) {
      return res.json({
        success: false,
        message: "providerId is required",
      });
    }

    const provider = await UserSetup.findOne({ userId: providerId });

    if (!provider) {
      return res.json({
        success: false,
        message: "Provider not found",
      });
    }

    const addressDoc = await UserAddress.findOne({ userId: providerId });

    const defaultAddress = addressDoc?.addresses?.find(
      (a) => a.isDefault
    );

    if (!defaultAddress) {
      return res.json({
        success: false,
        message: "Default address not set",
      });
    }

    const requests = await Booking.find({
      status: "OPEN",
      serviceName: { $in: provider.skills },
      "address.city": defaultAddress.city,
    }).sort({ createdAt: -1 }); 

    res.json({
      success: true,
      data: requests,
    });

  } catch (err) {
    res.json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;