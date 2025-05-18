// models/Comment.js
import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
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
    body: {
      type: String,
      required: true,
    },
    score: scoreSchema,
    parent_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
