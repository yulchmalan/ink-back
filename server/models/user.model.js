// models/User.js
import mongoose from "mongoose";

// константи для ролей та статусів
const ROLES = ["USER", "MODERATOR", "ADMIN", "OWNER"];
const FRIEND_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"];

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
    progress: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

//  читацькі списки
const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    titles: [savedTitleSchema],
  },
  { _id: false }
);

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

// додаткові налаштування профілю
const settingsSchema = new mongoose.Schema(
  {
    bio: {
      type: String,
    },
    pfp: {
      type: String,
    },
    banner: {
      type: String,
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
    settings: settingsSchema,
    created: {
      type: Date,
      default: Date.now,
    },
    last_online: {
      type: Date,
    },
    lists: [listSchema],
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
    role: {
      type: String,
      enum: ROLES,
      default: "USER",
    },
  },
  { timestamps: true }
);

// створення моделі
const User = mongoose.model("User", userSchema);

export default User;
