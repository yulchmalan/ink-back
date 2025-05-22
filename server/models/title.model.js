// models/Title.js
import mongoose from "mongoose";

const altNameSchema = new mongoose.Schema(
  {
    lang: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const titleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    cover: {
      type: String,
    },
    franchise: {
      type: String,
    },
    translation: {
      type: String,
      enum: ["TRANSLATED", "IN_PROGRESS", "NOT_TRANSLATED"],
      default: "NOT_TRANSLATED",
    },
    status: {
      type: String,
      enum: ["COMPLETED", "ONGOING", "ANNOUNCED"],
      default: "ANNOUNCED",
    },
    alt_names: {
      type: [altNameSchema],
      default: [],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    type: {
      type: String,
      enum: ["COMIC", "NOVEL"],
      required: true,
    },
  },
  { timestamps: true }
);

const Title = mongoose.model("Title", titleSchema);

export default Title;
