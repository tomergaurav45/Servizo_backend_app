import mongoose from "mongoose";

const userSetupSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
    },

    phone: {
      type: String,
      trim: true,
    },

    dob: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    skills: {
      type: [String],   
    },

    experience: {
      type: String,   
    },

    availability: {
      type: String,   
    },
  },
  {
    timestamps: true,
    collection: "UserSetup",
  }
);


userSetupSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const lastUser = await mongoose
      .model("UserSetup")
      .findOne({}, { userId: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;

    if (lastUser?.userId) {
      const lastNumber = parseInt(
        lastUser.userId.replace("User", ""),
        10
      );
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    this.userId = `User${String(nextNumber).padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const UserSetup = mongoose.model("UserSetup", userSetupSchema);
export default UserSetup;