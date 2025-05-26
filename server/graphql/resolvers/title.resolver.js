import Title from "../../models/title.model.js";
import Author from "../../models/author.model.js";
import Label from "../../models/label.model.js";
import TitleRating from "../../models/titleRating.model.js";
import { getChapterCount } from "../../lib/s3.js";
import mongoose from "mongoose";

export const titleResolvers = {
  Query: {
    async titles(_, { filter, sort, limit = 10, offset = 0, userId }) {
      try {
        const match = {};

        if (filter?.name) {
          match.$or = [
            { name: { $regex: filter.name, $options: "i" } },
            { "alt_names.value": { $regex: filter.name, $options: "i" } },
          ];
        }

        if (filter?.franchise)
          match.franchise = { $regex: filter.franchise, $options: "i" };
        if (filter?.translation) match.translation = filter.translation;
        if (filter?.status) match.status = filter.status;
        if (filter?.genreIds?.length)
          match.genres = {
            $all: filter.genreIds.map((id) => new mongoose.Types.ObjectId(id)),
          };
        if (filter?.tagIds?.length)
          match.tags = {
            $all: filter.tagIds.map((id) => new mongoose.Types.ObjectId(id)),
          };
        if (filter?.type) match.type = filter.type;

        const pipeline = [
          { $match: match },

          {
            $lookup: {
              from: "titleratings",
              localField: "_id",
              foreignField: "titleId",
              as: "rating",
            },
          },
          {
            $addFields: {
              rating: { $first: "$rating" },
              id: "$_id",
            },
          },
        ];

        // ⬇️ JOIN з users.lists.titles
        if (userId && filter?.list?.length) {
          pipeline.push(
            {
              $lookup: {
                from: "users",
                let: { titleId: "$_id" },
                pipeline: [
                  { $match: { _id: new mongoose.Types.ObjectId(userId) } },
                  { $unwind: "$lists" },
                  {
                    $match: {
                      $expr: {
                        $in: ["$lists.name", filter.list],
                      },
                    },
                  },
                  { $unwind: "$lists.titles" },
                  {
                    $match: {
                      $expr: { $eq: ["$lists.titles.title", "$$titleId"] },
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: "inList",
              },
            },
            { $match: { inList: { $ne: [] } } }
          );
        }

        if (filter?.rating) {
          const ratingMatch = {};
          if (filter.rating.gte !== undefined)
            ratingMatch["rating.avgRating"] = { $gte: filter.rating.gte };
          if (filter.rating.lte !== undefined) {
            ratingMatch["rating.avgRating"] = {
              ...(ratingMatch["rating.avgRating"] || {}),
              $lte: filter.rating.lte,
            };
          }
          pipeline.push({ $match: ratingMatch });
        }

        const sortFieldMap = {
          NAME: "name",
          CREATED_AT: "createdAt",
          RATING: "rating.avgRating",
        };

        if (sort && sortFieldMap[sort.field]) {
          pipeline.push({
            $sort: {
              [sortFieldMap[sort.field]]: sort.direction === "DESC" ? -1 : 1,
            },
          });
        }

        pipeline.push({ $skip: offset });
        pipeline.push({ $limit: limit });

        const results = await Title.aggregate(pipeline);

        const countPipeline = pipeline.filter(
          (stage) => !("$skip" in stage || "$limit" in stage)
        );
        countPipeline.push({ $count: "total" });
        const countResult = await Title.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        return { total, results };
      } catch (error) {
        console.error("error fetching titles:", error.message, error.stack);
        throw new Error("Failed to fetch titles");
      }
    },

    async getTitle(_, { id }) {
      try {
        const title = await Title.findById(id);
        if (!title) throw new Error("Title not found");

        const chapterCount = await getChapterCount(title._id.toString());

        return {
          ...title.toObject(),
          id: title._id,
          chapterCount,
        };
      } catch (error) {
        console.error("error fetching title:", error.message, error.stack);
        throw new Error("Failed to fetch title");
      }
    },
  },

  Mutation: {
    async createTitle(_, { input }) {
      try {
        const {
          name,
          description,
          authorId,
          cover,
          franchise,
          translation,
          status,
          alt_names,
          genreIds,
          tagIds,
          type,
        } = input;

        const newTitle = await Title.create({
          name,
          description,
          author: authorId,
          cover,
          franchise,
          translation,
          status,
          alt_names,
          genres: genreIds,
          tags: tagIds,
          type,
        });

        return newTitle;
      } catch (error) {
        console.error("error creating title:", error.message, error.stack);
        throw new Error("Failed to create title");
      }
    },

    async updateTitle(_, { id, input }) {
      try {
        const updates = {};

        if (input.name !== undefined) updates.name = input.name;
        if (input.description !== undefined)
          updates.description = input.description;
        if (input.authorId !== undefined) updates.author = input.authorId;
        if (input.cover !== undefined) updates.cover = input.cover;
        if (input.franchise !== undefined) updates.franchise = input.franchise;
        if (input.translation !== undefined)
          updates.translation = input.translation;
        if (input.status !== undefined) updates.status = input.status;
        if (input.alt_names !== undefined) updates.alt_names = input.alt_names;
        if (input.genreIds !== undefined) updates.genres = input.genreIds;
        if (input.tagIds !== undefined) updates.tags = input.tagIds;
        if (input.type !== undefined) updates.type = input.type;

        const updated = await Title.findByIdAndUpdate(id, updates, {
          new: true,
        });

        if (!updated) throw new Error("Title not found");

        return updated;
      } catch (error) {
        console.error("error updating title:", error.message, error.stack);
        throw new Error("Failed to update title");
      }
    },

    async deleteTitle(_, { id }) {
      try {
        const deleted = await Title.findByIdAndDelete(id);
        return !!deleted;
      } catch (error) {
        console.error("error deleting title:", error.message);
        throw new Error("Failed to delete title");
      }
    },
  },

  Title: {
    author: async (parent) => {
      return await Author.findById(parent.author);
    },
    genres: async (parent) => {
      return await Label.find({ _id: { $in: parent.genres } });
    },
    tags: async (parent) => {
      return await Label.find({ _id: { $in: parent.tags } });
    },
  },
};
