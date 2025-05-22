// models/User.js
import mongoose from "mongoose";

// константи для ролей та статусів
const ROLES = ["USER", "MODERATOR", "ADMIN", "OWNER"];
const FRIEND_STATUSES = ["PENDING", "ACCEPTED", "RECEIVED"];

// збережені твори в списках
const savedTitleSchema = new mongoose.Schema(
  {
    title: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Title",
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    last_open: {
      type: Date,
    },
    added: {
      type: Date,
    },
    progress: {
      type: Number,
      min: 0,
    },
    language: {
      type: String,
      default: "uk",
    },
  },
  { _id: false }
);

//  читацькі списки
const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  titles: [savedTitleSchema],
});

// друзі та статус дружби
const friendSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: FRIEND_STATUSES,
    },
  },
  { _id: false }
);

// основна схема користувача
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    bio: { type: String, default: "" },
    stats: {
      materialsAdded: {
        type: Number,
        default: 0,
      },
      titlesCreated: {
        type: Number,
        default: 0,
      },
    },
    recommendations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Title",
      },
    ],
    last_online: {
      type: Date,
    },
    lists: {
      type: [listSchema],
      default: [],
    },
    friends: [friendSchema],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    exp: {
      type: Number,
      default: 0,
      min: 0,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "USER",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
