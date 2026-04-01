import express from "express";
import Issue from "../models/issueModel.js";

const router = express.Router();

router.post("/create-issue", async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();

    res.json({
      success: true,
      message: "Issue submitted",
      data: issue,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error",
    });
  }
});

export default router;