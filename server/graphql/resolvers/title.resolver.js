import Title from "../../models/title.model.js";
import Author from "../../models/author.model.js";
import Label from "../../models/label.model.js";

export const titleResolvers = {
  Query: {
    async titles(_, { filter, sort, limit = 10, offset = 0 }) {
      try {
        const query = {};

        if (filter?.name) {
          query.name = { $regex: filter.name, $options: "i" };
        }
        if (filter?.franchise) {
          query.franchise = { $regex: filter.franchise, $options: "i" };
        }
        if (filter?.translation) {
          query.translation = filter.translation;
        }
        if (filter?.status) {
          query.status = filter.status;
        }

        let sortOptions = {};
        if (sort) {
          const fieldMap = {
            NAME: "name",
            CREATED_AT: "createdAt",
          };
          const direction = sort.direction === "DESC" ? -1 : 1;
          sortOptions[fieldMap[sort.field]] = direction;
        }

        const total = await Title.countDocuments(query);
        const results = await Title.find(query)
          .sort(sortOptions)
          .skip(offset)
          .limit(limit);

        return { total, results };
      } catch (error) {
        console.error("error fetching titles:", error.message, error.stack);
        throw new Error("Failed to fetch titles");
      }
    },

    async getTitle(_, { id }) {
      return await Title.findById(id);
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
          content,
          genreIds,
          tagIds,
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
          content,
          genres: genreIds,
          tags: tagIds,
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
        if (input.content !== undefined) updates.content = input.content;
        if (input.genreIds !== undefined) updates.genres = input.genreIds;
        if (input.tagIds !== undefined) updates.tags = input.tagIds;

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
