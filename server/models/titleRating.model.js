import mongoose from "mongoose";

const TitleRatingSchema = new mongoose.Schema({
  titleId: { type: mongoose.Schema.Types.ObjectId, ref: "Title", unique: true },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});

export default mongoose.model("TitleRating", TitleRatingSchema);
