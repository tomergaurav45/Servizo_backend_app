import express from "express";
import Booking from "../models/BookingDetails.js";
import UserSetup from "../models/UserSetup.js";
import UserAddress from "../models/UserAddress.js";
import Notification from "../models/Notification.js"

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


    const provider = await UserSetup.findOne({ userId: providerId });

    if (!provider) {
      return res.json({
        success: false,
        message: "Provider not found",
      });
    }


    booking.participants.provider = {
      providerId: provider.userId,
      name: provider.name,
      phone: provider.phone,
      email: provider.email,
      gender: provider.gender,
      experience: provider.experience,
      availability: provider.availability,
    };


    booking.status = "ASSIGNED";

    await booking.save();

    await Notification.create({
      userId: booking.participants.user.userId,
      title: "Booking Accepted ✅",
      message: `${provider.name} accepted your ${booking.serviceName} request`,
      type: "booking",
    });

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


const openJobs = await Booking.find({
  status: "OPEN",
  serviceName: { $in: provider.skills },
  "address.city": defaultAddress.city,
});


    const assignedJobs = await Booking.find({
      status: "ASSIGNED",
      "participants.provider.providerId": providerId,
    });


    const completedJobs = await Booking.find({
      status: "COMPLETED",
      "participants.provider.providerId": providerId,
    });


    const allJobs = [
      ...openJobs,
      ...assignedJobs,
      ...completedJobs,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: allJobs,
    });

  } catch (err) {
    console.error("Provider Requests Error:", err);

    res.json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;