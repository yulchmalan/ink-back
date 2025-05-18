// models/ReportType.js
import mongoose from "mongoose";

const reportTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const ReportType = mongoose.model("ReportType", reportTypeSchema);

export default ReportType;
