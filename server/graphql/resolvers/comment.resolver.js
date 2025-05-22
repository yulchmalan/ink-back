import Comment from "../../models/comment.model.js";
import User from "../../models/user.model.js";
import Title from "../../models/title.model.js";
import { isValidObjectId, Types } from "mongoose";

export const commentResolvers = {
  Query: {
    async comments(
      _,
      {
        filter = {},
        sortBy = "CREATED_AT",
        sortOrder = "DESC",
        limit = 10,
        offset = 0,
      }
    ) {
      try {
        const query = {};

        if (filter.userId && isValidObjectId(filter.userId)) {
          query.user_ID = Types.ObjectId.createFromHexString(filter.userId);
        }

        if (filter.subjectId && isValidObjectId(filter.subjectId)) {
          query.subject_ID = Types.ObjectId.createFromHexString(
            filter.subjectId
          );
        }

        const sortDirection = sortOrder === "ASC" ? 1 : -1;

        if (sortBy === "RATING") {
          const total = await Comment.countDocuments(query);

          const results = await Comment.aggregate([
            { $match: query },
            {
              $addFields: {
                rating: { $subtract: ["$score.likes", "$score.dislikes"] },
              },
            },
            { $sort: { rating: sortDirection } },
            { $skip: offset },
            { $limit: limit },
            {
              $project: {
                id: "$_id", // ← ОБОВ'ЯЗКОВО
                _id: 1,
                body: 1,
                createdAt: 1,
                score: 1,
                subject_ID: 1,
                user_ID: 1,
              },
            },
          ]);

          return { total, results };
        }

        const sortFieldMap = {
          CREATED_AT: "createdAt",
          LIKES: "score.likes",
          DISLIKES: "score.dislikes",
        };

        const sortField = sortFieldMap[sortBy] || "createdAt";

        const total = await Comment.countDocuments(query);
        const results = await Comment.find(query)
          .sort({ [sortField]: sortDirection })
          .skip(offset)
          .limit(limit);

        return { total, results };
      } catch (error) {
        console.error("error fetching comments:", error);
        throw new Error("Failed to fetch comments");
      }
    },

    async comment(_, { id }) {
      try {
        return await Comment.findById(id);
      } catch (error) {
        console.error("error fetching comment:", error.message);
        throw new Error("Failed to fetch comment");
      }
    },
  },

  Mutation: {
    async createComment(_, { input }) {
      try {
        const { userId, subjectId, body, parentId } = input;

        const newComment = await Comment.create({
          user_ID: userId,
          subject_ID: subjectId,
          body,
          parent_ID: parentId || null,
          score: { likes: 0, dislikes: 0 },
        });

        await User.findByIdAndUpdate(userId, {
          $push: { comments: newComment._id },
        });

        return newComment;
      } catch (error) {
        console.error("error creating comment:", error.message);
        throw new Error("Failed to create comment");
      }
    },

    async editComment(_, { id, edits }) {
      try {
        const updated = await Comment.findByIdAndUpdate(id, edits, {
          new: true,
        });
        return updated;
      } catch (error) {
        console.error("error editing comment:", error.message);
        throw new Error("Failed to edit comment");
      }
    },

    async deleteComment(_, { id }) {
      try {
        const deleted = await Comment.findByIdAndDelete(id);
        return !!deleted;
      } catch (error) {
        console.error("error deleting comment:", error.message);
        throw new Error("Failed to delete comment");
      }
    },

    async likeComment(_, { id }) {
      try {
        return await Comment.findByIdAndUpdate(
          id,
          { $inc: { "score.likes": 1 } },
          { new: true }
        );
      } catch (error) {
        console.error("error liking comment:", error.message);
        throw new Error("Failed to like comment");
      }
    },

    async dislikeComment(_, { id }) {
      try {
        return await Comment.findByIdAndUpdate(
          id,
          { $inc: { "score.dislikes": 1 } },
          { new: true }
        );
      } catch (error) {
        console.error("error disliking comment:", error.message);
        throw new Error("Failed to dislike comment");
      }
    },
  },

  Comment: {
    async user(parent) {
      return await User.findById(parent.user_ID);
    },
    async parent(parent) {
      return parent.parent_ID ? await Comment.findById(parent.parent_ID) : null;
    },
    async title(parent) {
      return await Title.findById(parent.subject_ID);
    },
  },
};
