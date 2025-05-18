// models/Title.js
import mongoose from "mongoose";

// вкладений контент: розділи, томи
const contentSchema = new mongoose.Schema(
  {
    volume: {
      type: Number,
      required: true,
    },
    chapter: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
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
      type: [String],
      default: [],
    },
    contents: [contentSchema],
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
  },
  { timestamps: true }
);

const Title = mongoose.model("Title", titleSchema);

export default Title;
