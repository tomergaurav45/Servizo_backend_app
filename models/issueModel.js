import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  userId: String,
  issueType: String,
  subject: String,
  description: String,
  url: String,
});

export default mongoose.model("Issue", issueSchema);