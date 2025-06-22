import Collection from "../../models/collection.model.js";
import User from "../../models/user.model.js";
import Title from "../../models/title.model.js";
import mongoose from "mongoose";
const { Types } = mongoose;

export const collectionResolvers = {
  Query: {
    async collections(
      _,
      {
        filter = {},
        sortBy = "CREATED_AT",
        sortOrder = "DESC",
        limit = 100,
        offset = 0,
        search,
      }
    ) {
      const query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      if (filter.userId) {
        query.user_ID = new Types.ObjectId(filter.userId);
      }
      if (filter.name) {
        query.name = { $regex: filter.name, $options: "i" };
      }
      if (filter.titleId) {
        query.titles = { $in: [new Types.ObjectId(filter.titleId)] };
      }

      const sortDirection = sortOrder === "ASC" ? 1 : -1;

      if (sortBy === "RATING") {
        const total = await Collection.countDocuments(query);

        const results = await Collection.aggregate([
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
              name: 1,
              description: 1,
              views: 1,
              createdAt: 1,
              score: 1,
              titles: 1,
            },
          },
        ]);

        return { total, results };
      }

      const sortFieldMap = {
        CREATED_AT: "createdAt",
        LIKES: "score.likes",
      };

      const sortField = sortFieldMap[sortBy] || "createdAt";

      const total = await Collection.countDocuments(query);
      const results = await Collection.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(offset)
        .limit(limit);

      return { total, results };
    },
    collection: async (_, { id }) => {
      return await Collection.findById(id);
    },
  },

  Mutation: {
    async createCollection(_, { input }) {
      const { name, description, userId, titleIds } = input;
      const newCollection = await Collection.create({
        name,
        description,
        user_ID: userId,
        titles: titleIds,
        views: 0,
        score: { likes: 0, dislikes: 0 },
      });

      return newCollection;
    },

    async editCollection(_, { id, edits }) {
      const updated = await Collection.findByIdAndUpdate(
        id,
        { ...edits },
        { new: true }
      );
      return updated;
    },

    async removeTitleFromCollection(_, { collectionId, titleId }) {
      const updated = await Collection.findByIdAndUpdate(
        collectionId,
        { $pull: { titles: titleId } },
        { new: true }
      );
      return updated;
    },

    async deleteCollection(_, { id }) {
      const deleted = await Collection.findByIdAndDelete(id);
      return !!deleted;
    },

    async addTitleToCollection(_, { collectionId, titleId }) {
      const updated = await Collection.findByIdAndUpdate(
        collectionId,
        { $addToSet: { titles: titleId } },
        { new: true }
      );
      return updated;
    },

    async likeCollection(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const collection = await Collection.findById(id);
      if (!collection) throw new Error("Collection not found");

      const liked = collection.score.likedBy?.some((uid) => uid.equals(userId));
      const disliked = collection.score.dislikedBy?.some((uid) =>
        uid.equals(userId)
      );

      if (liked) {
        collection.score.likes--;
        collection.score.likedBy.pull(userId);
      } else {
        collection.score.likes++;
        collection.score.likedBy.push(userId);
        if (disliked) {
          collection.score.dislikes--;
          collection.score.dislikedBy.pull(userId);
        }
      }

      await collection.save();
      return collection;
    },

    async dislikeCollection(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const collection = await Collection.findById(id);
      if (!collection) throw new Error("Collection not found");

      const liked = collection.score.likedBy?.some((uid) => uid.equals(userId));
      const disliked = collection.score.dislikedBy?.some((uid) =>
        uid.equals(userId)
      );

      if (disliked) {
        collection.score.dislikes--;
        collection.score.dislikedBy.pull(userId);
      } else {
        collection.score.dislikes++;
        collection.score.dislikedBy.push(userId);
        if (liked) {
          collection.score.likes--;
          collection.score.likedBy.pull(userId);
        }
      }

      await collection.save();
      return collection;
    },

    async clearCollectionVote(_, { id, userId }) {
      userId = new Types.ObjectId(userId);
      const collection = await Collection.findById(id);
      if (!collection) throw new Error("Collection not found");

      const liked = collection.score.likedBy?.some((uid) => uid.equals(userId));
      const disliked = collection.score.dislikedBy?.some((uid) =>
        uid.equals(userId)
      );

      if (liked) {
        collection.score.likes--;
        collection.score.likedBy.pull(userId);
      }
      if (disliked) {
        collection.score.dislikes--;
        collection.score.dislikedBy.pull(userId);
      }

      await collection.save();
      return collection;
    },

    async incrementCollectionViews(_, { id }) {
      const collection = await Collection.findById(id);
      if (!collection) throw new Error("Collection not found");

      collection.views = (collection.views ?? 0) + 1;
      await collection.save();
      return collection;
    },
  },

  Collection: {
    async user(parent) {
      return await User.findById(parent.user_ID);
    },
    async titles(parent) {
      return await Title.find({ _id: { $in: parent.titles } });
    },
  },
};
