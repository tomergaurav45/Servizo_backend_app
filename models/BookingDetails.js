import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
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
      city: { type: String }, 
      
    },

    status: {
      type: String,
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BookingDetails", bookingSchema);