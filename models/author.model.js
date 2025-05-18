// models/Author.js
import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 5000,
    },
    photo: {
      type: String,
    },
    alt_names: {
      type: [String],
      default: [],
    },
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Author = mongoose.model("Author", authorSchema);

export default Author;
