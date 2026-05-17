import express from "express";
import ServiceVariants from "../models/ServiceVariants.js";

const router = express.Router();


router.get("/service-variants", async (req, res) => {
  try {
    const data = await ServiceVariants.find({
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/service-variants/:serviceName", async (req, res) => {
  try {
    const { serviceName } = req.params;

    const data = await ServiceVariants.findOne({
      serviceName: {
        $regex: new RegExp(`^${serviceName}$`, "i"),
      },
      isActive: true,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Service variants not found",
      });
    }

    res.status(200).json({
      success: true,
      data: data.variants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;