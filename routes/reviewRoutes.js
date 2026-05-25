import Reviews from "../models/Reviews.js";
import express from "express";
import Booking from "../models/BookingDetails.js";
import UserSetup from "../models/UserSetup.js";

const router = express.Router();

router.post("/add-review", async (req, res) => {
    try {
        const { bookingId, providerId, userId, rating, comment } = req.body;


        if (!bookingId || !providerId || !userId || !rating) {
            return res.json({
                success: false,
                message: "Required fields missing",
            });
        }
        const booking = await Booking.findOne({ bookingId });

        if (!booking) {
            return res.json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status !== "COMPLETED") {
            return res.json({
                success: false,
                message: "Job not completed yet",
            });
        }

        const existingReview = await Reviews.findOne({ bookingId });

        if (existingReview) {
            return res.json({
                success: false,
                message: "Review already submitted",
            });
        }
        const newReview = new Reviews({
            bookingId,
            providerId,
            userId,
            rating,
            comment,
        });

        await newReview.save();

        try {
    await Notification.create({
    userId: providerId,
    bookingId,
    title: "New Review ⭐",
    message: `You received a ${rating} star review for ${booking.serviceName}`,
    type: "review",
});
} catch (notificationError) {
    console.log("Notification Error:", notificationError);
}


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

        const reviews = await Reviews.find({ providerId })
            .sort({ createdAt: -1 })
            .lean();
        const userIds = reviews.map(r => r.userId);

        const users = await UserSetup.find({
            userId: { $in: userIds }
        }).lean();


        const userMap = {};
        users.forEach(u => {
            userMap[u.userId] = u.name;
        });


        const enrichedReviews = reviews.map(r => ({
            ...r,
            userName: userMap[r.userId] || "User"
        }));

        let avgRating = 0;

        if (reviews.length > 0) {
            const total = reviews.reduce((sum, r) => sum + r.rating, 0);
            avgRating = (total / reviews.length).toFixed(1);
        }

        res.json({
            success: true,
            data: {
                reviews: enrichedReviews,
                avgRating,
                totalReviews: reviews.length,
            },
        });

    } catch (err) {
        res.json({ success: false, message: "Server error" });
    }
});

export default router;