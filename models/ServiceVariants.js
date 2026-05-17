import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            default: 0,
        },

        perKm: {
            type: Number,
            default: 0,
        },
    },
    {
        _id: false,
    }
);

const ServiceVariantsSchema = new mongoose.Schema(
    {
        serviceName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        variants: {
            type: [VariantSchema],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "ServiceVariants",
    }
);

export default mongoose.model(
    "ServiceVariants",
    ServiceVariantsSchema
);