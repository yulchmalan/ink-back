import mongoose from "mongoose";

const labelNameSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    uk: { type: String, required: true },
    pl: { type: String, required: true },
  },
  { _id: false }
);

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: labelNameSchema,
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

export default mongoose.model("Label", labelSchema);
