import Comment from "../../models/comment.model.js";
import User from "../../models/user.model.js";
import Title from "../../models/title.model.js";
import { isValidObjectId, Types } from "mongoose";

async function deleteCommentWithReplies(commentId) {
  const replies = await Comment.find({ parent_ID: commentId });

  for (const reply of replies) {
    await deleteCommentWithReplies(reply._id);
  }

  await Comment.findByIdAndDelete(commentId);
}

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

        if (filter.parentId !== undefined) {
          if (filter.parentId === null) {
            query.parent_ID = null;
          } else if (isValidObjectId(filter.parentId)) {
            query.parent_ID = new Types.ObjectId(String(filter.parentId));
          } else {
            console.error("Invalid parentId:", filter.parentId);
            throw new Error("Invalid parentId");
          }
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
                id: "$_id",
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
        const { userId, subjectId, subjectType, body, parentId } = input;

        const newComment = await Comment.create({
          user_ID: userId,
          subject_ID: subjectId,
          subjectType,
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
        await deleteCommentWithReplies(id);
        return true;
      } catch (error) {
        console.error("error deleting comment and replies:", error.message);
        throw new Error("Failed to delete comment");
      }
    },

    async likeComment(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const comment = await Comment.findById(id);
      if (!comment) throw new Error("Comment not found");

      const liked = comment.score.likedBy.some((uid) => uid.equals(userId));
      const disliked = comment.score.dislikedBy.some((uid) =>
        uid.equals(userId)
      );

      if (liked) {
        comment.score.likes--;
        comment.score.likedBy.pull(userId);
      } else {
        comment.score.likes++;
        comment.score.likedBy.push(userId);
        if (disliked) {
          comment.score.dislikes--;
          comment.score.dislikedBy.pull(userId);
        }
      }

      await comment.save();
      return comment;
    },

    async dislikeComment(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const comment = await Comment.findById(id);
      if (!comment) throw new Error("Comment not found");

      const liked = comment.score.likedBy.some((uid) => uid.equals(userId));
      const disliked = comment.score.dislikedBy.some((uid) =>
        uid.equals(userId)
      );

      if (disliked) {
        comment.score.dislikes--;
        comment.score.dislikedBy.pull(userId);
      } else {
        comment.score.dislikes++;
        comment.score.dislikedBy.push(userId);
        if (liked) {
          comment.score.likes--;
          comment.score.likedBy.pull(userId);
        }
      }

      await comment.save();
      return comment;
    },

    async clearCommentVote(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const comment = await Comment.findById(id);
      if (!comment) throw new Error("Comment not found");

      const liked = comment.score.likedBy.some((uid) => uid.equals(userId));
      const disliked = comment.score.dislikedBy.some((uid) =>
        uid.equals(userId)
      );

      if (liked) {
        comment.score.likes--;
        comment.score.likedBy.pull(userId);
      }
      if (disliked) {
        comment.score.dislikes--;
        comment.score.dislikedBy.pull(userId);
      }

      await comment.save();
      return comment;
    },
  },

  Comment: {
    async user(parent) {
      return await User.findById(parent.user_ID);
    },

    parent_ID(parent) {
      return parent.parent_ID || null;
    },

    async title(parent) {
      return await Title.findById(parent.subject_ID);
    },

    subjectType(parent) {
      return parent.subjectType;
    },
  },
};
