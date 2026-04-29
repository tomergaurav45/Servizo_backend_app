import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },

    
    participants: {
      user: {
        userId: {
          type: String,
          required: true,
          index: true,
        },
        name: String,
        phone: String,
        email: String,
        gender: String,
      },

      provider: {
        providerId: {
          type: String,
          default: null,
          index: true,
        },
        name: String,
        phone: String,
        email: String,
        gender: String,
        experience: String,
        availability: String,
      },
    },

    serviceCategory: {
      type: String,
      required: true,
      index: true,
    },

    serviceName: {
      type: String,
      required: true,
      index: true,
    },

    subService: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
    },

    address: {
      title: { type: String },
      fullAddress: { type: String },
      landmark: { type: String },

      latitude: { type: Number },
      longitude: { type: Number },
      city: { type: String, index: true },
    },

    status: {
      type: String,
      enum: ["OPEN", "ASSIGNED", "COMPLETED", "CANCELLED"],
      default: "OPEN",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "BookingDetails",
  }
);

export default mongoose.model("BookingDetails", bookingSchema);