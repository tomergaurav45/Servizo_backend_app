import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    fullAddress: {
      type: String,
      required: true,
    },
    landmark: String,
    type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    city: String,
    state: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const userAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
    collection: "UserAddress",
  }
);

const UserAddress = mongoose.model("UserAddress", userAddressSchema);
export default UserAddress;