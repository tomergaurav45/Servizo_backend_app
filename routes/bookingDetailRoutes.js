import express from "express";
import Booking from "../models/BookingDetails.js";
import User from "../models/UserSetup.js";
import UserAddress from "../models/UserAddress.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.post("/create-booking", async (req, res) => {
  try {
    const {
      userId,
      addressId,
      serviceName,
      subService,
      serviceCategory,
      description,
      notes,
      providerId,
      price,
    } = req.body;


    if (!userId || !serviceName || !serviceCategory || !subService || !description || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }


    const user = await User.findOne({ userId });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }


    const addressDoc = await UserAddress.findOne({ userId });
    if (!addressDoc) {
      return res.json({ success: false, message: "Address not found" });
    }

    const selectedAddress = addressDoc.addresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!selectedAddress) {
      return res.json({ success: false, message: "Invalid addressId" });
    }


    const lastBooking = await Booking.findOne().sort({ createdAt: -1 });

    let nextId = 1;
    if (lastBooking?.bookingId) {
      const lastNumber = parseInt(lastBooking.bookingId.replace("BK", ""));
      nextId = lastNumber + 1;
    }

    const bookingId = `BK${String(nextId).padStart(4, "0")}`;


    let providerData = null;
    let status = "OPEN";

    if (providerId) {
      const provider = await User.findOne({ userId: providerId });

      if (provider) {
        providerData = {
          providerId: provider.userId,
          name: provider.name,
          phone: provider.phone,
          email: provider.email,
          gender: provider.gender,
          experience: provider.experience,
          availability: provider.availability,
        };

        status = "ASSIGNED";
      }
    }


    const newBooking = new Booking({
      bookingId,

      participants: {
        user: {
          userId: user.userId,
          name: user.name,
          phone: user.phone,
          email: user.email,
          gender: user.gender,
        },
        provider: providerData,
      },

      serviceName,
      serviceCategory,
      subService,
      description,
      notes,
      price: price || 0,

      address: {
        title: selectedAddress.type,
        fullAddress: selectedAddress.fullAddress,
        landmark: selectedAddress.landmark,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        city: selectedAddress.city,
      },

      status,
    });

    await newBooking.save();

    const providers = await User.find({
      role: "provider",
      isOnline: true
    });

    for (const provider of providers) {
      await Notification.create({
        userId: provider.userId,
        title: "New Service Request",
        message: `New booking for ${serviceName}`,
        type: "booking",
      });
    }

    return res.status(201).json({
      success: true,
      message: status === "ASSIGNED"
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


router.get("/user-bookings", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json({
        success: false,
        message: "userId is required",
      });
    }

    const bookings = await Booking.find({
      "participants.user.userId": userId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: bookings,
    });

  } catch (error) {
    console.error("Get User Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/complete-booking", async (req, res) => {
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

    if (
      booking.participants?.provider?.providerId !== providerId
    ) {
      return res.json({
        success: false,
        message: "Not authorized",
      });
    }

    if (booking.status !== "ASSIGNED") {
      return res.json({
        success: false,
        message: "Job not in progress",
      });
    }


    booking.status = "COMPLETED";
    await booking.save();


    await Notification.create({
      userId: booking.participants.user.userId,
      title: "Service Completed 🎉",
      message: `${booking.serviceName} service completed successfully`,
      type: "booking",
    });

    res.json({
      success: true,
      message: "Job completed successfully",
      data: booking,
    });

  } catch (err) {
    console.error("Complete Booking Error:", err);

    res.json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;