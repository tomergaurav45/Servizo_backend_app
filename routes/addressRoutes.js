import express from "express";
import UserAddress from "../models/UserAddress.js";

const router = express.Router();


router.post("/save-adresses", async (req, res) => {
  try {
    const {
      userId,
      fullAddress,
      landmark,
      type,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    if (!userId || !fullAddress) {
      return res.status(400).json({
        success: false,
        message: "userId and fullAddress are required",
      });
    }

    let user = await UserAddress.findOne({ userId });


    if (isDefault && user) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    const newAddress = {
      fullAddress,
      landmark,
      type,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    };

    if (!user) {

      user = new UserAddress({
        userId,
        addresses: [newAddress],
      });
    } else {

      user.addresses.push(newAddress);
    }

    await user.save();

    res.json({
      success: true,
      message: "Address added successfully",
      data: user,
    });

  } catch (error) {
    console.error("Address error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



router.get("/save-adresses/:userId", async (req, res) => {
  try {
    const user = await UserAddress.findOne({
      userId: req.params.userId,
    });

    res.json({
      success: true,
      data: user?.addresses || [],
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});



router.put("/update-address", async (req, res) => {
  try {
    const { userId, addressId, updateData } = req.body;

    const updatedUser = await UserAddress.findOneAndUpdate(
      {
        userId,
        "addresses._id": addressId,
      },
      {
        $set: {
          "addresses.$": updateData,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Address updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});



router.delete("/delete-address", async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    const updatedUser = await UserAddress.findOneAndUpdate(
      { userId },
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Address deleted successfully",
      data: updatedUser,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;