import Collection from "../../models/collection.model.js";
import User from "../../models/user.model.js";
import Title from "../../models/title.model.js";

export const collectionResolvers = {
  Query: {
    async collections(
      _,
      {
        filter = {},
        sortBy = "CREATED_AT",
        sortOrder = "DESC",
        limit = 10,
        offset = 0,
      }
    ) {
      const query = {};
      if (filter.userId) {
        query.user_ID = filter.userId;
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

    async deleteCollection(_, { id }) {
      const deleted = await Collection.findByIdAndDelete(id);
      return !!deleted;
    },

    async likeCollection(_, { id }) {
      return await Collection.findByIdAndUpdate(
        id,
        { $inc: { "score.likes": 1 } },
        { new: true }
      );
    },

    async dislikeCollection(_, { id }) {
      return await Collection.findByIdAndUpdate(
        id,
        { $inc: { "score.dislikes": 1 } },
        { new: true }
      );
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
