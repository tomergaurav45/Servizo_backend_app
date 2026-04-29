import Reviews from "../models/Reviews.js";
import express from "express";

const router = express.Router();

router.post("/add-review", async (req, res) => {
  try {
    const { bookingId, providerId, userId, rating, comment } = req.body;

    // ✅ Validation
    if (!bookingId || !providerId || !userId || !rating) {
      return res.json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ Check booking exists
    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ Only completed jobs can be reviewed
    if (booking.status !== "COMPLETED") {
      return res.json({
        success: false,
        message: "Job not completed yet",
      });
    }

    // ✅ Prevent duplicate review
    const existingReview = await Reviews.findOne({ bookingId });

    if (existingReview) {
      return res.json({
        success: false,
        message: "Review already submitted",
      });
    }

    // ✅ Save review
    const newReview = new Reviews({
      bookingId,
      providerId,
      userId,
      rating,
      comment,
    });

    await newReview.save();

    res.json({
      success: true,
      message: "Review added successfully",
      data: newReview,
    });

  } catch (err) {
    console.error("Add Review Error:", err);

    res.json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/provider-reviews", async (req, res) => {
  try {
    const { providerId } = req.query;

    if (!providerId) {
      return res.json({
        success: false,
        message: "providerId is required",
      });
    }

   
    const reviews = await Reviews.find({ providerId }).sort({ createdAt: -1 });

  
    let avgRating = 0;

    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = (total / reviews.length).toFixed(1);
    }

    res.json({
      success: true,
      data: {
        reviews,
        avgRating,
        totalReviews: reviews.length,
      },
    });

  } catch (err) {
    console.error("Get Reviews Error:", err);

    res.json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;