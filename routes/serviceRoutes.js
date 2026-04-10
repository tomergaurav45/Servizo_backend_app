import express from "express";
const router = express.Router();
import Service from "../models/Service.js";

router.get("/services", async (req, res) => {
    try {
        const services = await Service.find();
        if (!services || services.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No services found"
            });
        }
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;