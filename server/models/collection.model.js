import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { _id: false }
);

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    user_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Title" }],
    views: { type: Number, default: 0 },
    score: scoreSchema,
  },
  { timestamps: true }
);

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
