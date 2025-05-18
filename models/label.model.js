// models/Label.js
import mongoose from "mongoose";

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["TAG", "GENRE"],
      required: true,
    },
  },
  { timestamps: true }
);

const Label = mongoose.model("Label", labelSchema);

export default Label;
