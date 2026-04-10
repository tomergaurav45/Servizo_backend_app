import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  data: [
    {
      name: String,
      icon: String
    }
  ]
});
export default mongoose.model("AllServices", serviceSchema);