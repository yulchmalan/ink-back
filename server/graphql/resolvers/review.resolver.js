import Review from "../../models/review.model.js";
import User from "../../models/user.model.js";
import Title from "../../models/title.model.js";
import Comment from "../../models/comment.model.js";
import mongoose from "mongoose";
const { Types } = mongoose;

export const reviewResolvers = {
  Query: {
    async reviews(
      _,
      {
        filter = {},
        sortBy = "CREATED_AT",
        sortOrder = "DESC",
        limit = 10,
        offset = 0,
        search,
      }
    ) {
      try {
        const query = {};
        if (search) {
          query.name = { $regex: search, $options: "i" };
        }
        if (filter.userId) query.user_ID = filter.userId;
        if (filter.titleId) query.title_ID = filter.titleId;
        if (filter.minRating !== undefined)
          query.rating = { ...query.rating, $gte: filter.minRating };
        if (filter.maxRating !== undefined)
          query.rating = { ...query.rating, $lte: filter.maxRating };

        const sortFields = {
          CREATED_AT: "createdAt",
          RATING: "rating",
          VIEWS: "views",
        };

        const sortField = sortFields[sortBy] || "createdAt";
        const direction = sortOrder === "ASC" ? 1 : -1;

        const total = await Review.countDocuments(query);
        const results = await Review.find(query)
          .sort({ [sortField]: direction })
          .skip(offset)
          .limit(limit);

        return { total, results };
      } catch (error) {
        console.error("error fetching reviews:", error.message);
        throw new Error("Failed to fetch reviews");
      }
    },

    async review(_, { id }) {
      try {
        return await Review.findById(id);
      } catch (error) {
        console.error("error fetching review:", error.message);
        throw new Error("Failed to fetch review");
      }
    },
  },

  Mutation: {
    async createReview(_, { input }) {
      try {
        const { name, body, rating, userId, titleId } = input;

        const newReview = await Review.create({
          name,
          body,
          rating,
          user_ID: userId,
          title_ID: titleId,
          views: 0,
          score: { likes: 0, dislikes: 0 },
        });

        await User.findByIdAndUpdate(userId, {
          $push: { reviews: newReview._id },
        });

        return newReview;
      } catch (error) {
        console.error("error creating review:", error.message);
        throw new Error("Failed to create review");
      }
    },

    async editReview(_, { id, edits }) {
      try {
        const updated = await Review.findByIdAndUpdate(id, edits, {
          new: true,
        });
        return updated;
      } catch (error) {
        console.error("error editing review:", error.message);
        throw new Error("Failed to edit review");
      }
    },

    async deleteReview(_, { id }) {
      try {
        const deleted = await Review.findByIdAndDelete(id);
        return !!deleted;
      } catch (error) {
        console.error("error deleting review:", error.message);
        throw new Error("Failed to delete review");
      }
    },

    async likeReview(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const review = await Review.findById(id);
      if (!review) throw new Error("Review not found");

      const liked = review.score.likedBy?.some((uid) => uid.equals(userId));
      const disliked = review.score.dislikedBy?.some((uid) =>
        uid.equals(userId)
      );

      if (liked) {
        review.score.likes--;
        review.score.likedBy.pull(userId);
      } else {
        review.score.likes++;
        review.score.likedBy.push(userId);
        if (disliked) {
          review.score.dislikes--;
          review.score.dislikedBy.pull(userId);
        }
      }

      await review.save();
      return review;
    },

    async dislikeReview(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const review = await Review.findById(id);
      if (!review) throw new Error("Review not found");

      const liked = review.score.likedBy?.some((uid) => uid.equals(userId));
      const disliked = review.score.dislikedBy?.some((uid) =>
        uid.equals(userId)
      );

      if (disliked) {
        review.score.dislikes--;
        review.score.dislikedBy.pull(userId);
      } else {
        review.score.dislikes++;
        review.score.dislikedBy.push(userId);
        if (liked) {
          review.score.likes--;
          review.score.likedBy.pull(userId);
        }
      }

      await review.save();
      return review;
    },

    async clearReviewVote(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const review = await Review.findById(id);
      if (!review) throw new Error("Review not found");

      const liked = review.score.likedBy?.some((uid) => uid.equals(userId));
      const disliked = review.score.dislikedBy?.some((uid) =>
        uid.equals(userId)
      );

      if (liked) {
        review.score.likes--;
        review.score.likedBy.pull(userId);
      }
      if (disliked) {
        review.score.dislikes--;
        review.score.dislikedBy.pull(userId);
      }

      await review.save();
      return review;
    },
    async incrementReviewViews(_, { id }) {
      const review = await Review.findById(id);
      if (!review) throw new Error("Review not found");

      review.views = (review.views ?? 0) + 1;
      await review.save();
      return review;
    },
  },

  Review: {
    async user(parent) {
      return await User.findById(parent.user_ID);
    },
    async title(parent) {
      return await Title.findById(parent.title_ID);
    },
    async comments(parent) {
      return await Comment.find({ _id: { $in: parent.comments } });
    },
  },
};
