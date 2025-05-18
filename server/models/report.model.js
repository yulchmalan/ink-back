// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject_ID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReportType",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SENDED", "REVIEWED", "RESOLVED"],
      default: "SENDED",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;
