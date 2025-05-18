import Author from "../../models/author.model.js";
import User from "../../models/user.model.js";

export const authorResolvers = {
  Query: {
    async authors(_, { filter, sort, limit = 10, offset = 0 }) {
      try {
        const query = {};

        if (filter?.name) {
          query.name = { $regex: filter.name, $options: "i" };
        }
        if (filter?.alt_name) {
          query.alt_names = {
            $elemMatch: { $regex: filter.alt_name, $options: "i" },
          };
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

        const total = await Author.countDocuments(query);

        const results = await Author.find(query)
          .sort(sortOptions)
          .skip(offset)
          .limit(limit);

        return { total, results };
      } catch (error) {
        console.error("error fetching authors with filters:", error);
        throw new Error("Failed to fetch authors");
      }
    },

    async getAuthor(_, { id }) {
      try {
        const author = await Author.findById(id);
        if (!author) throw new Error("Author not found");
        return author;
      } catch (error) {
        console.error("error fetching author by ID:", error);
        throw new Error("Failed to get author");
      }
    },
  },

  Mutation: {
    async createAuthor(_, { name, alt_names, bio, photo }) {
      try {
        const newAuthor = await Author.create({ name, alt_names, bio, photo });
        return newAuthor;
      } catch (error) {
        console.error("error creating author:", error);
        throw new Error("Failed to create author");
      }
    },

    async updateAuthor(_, { id, name, alt_names, bio, photo }) {
      try {
        const updatedAuthor = await Author.findByIdAndUpdate(
          id,
          {
            ...(name !== undefined && { name }),
            ...(alt_names !== undefined && { alt_names }),
            ...(bio !== undefined && { bio }),
            ...(photo !== undefined && { photo }),
          },
          { new: true }
        );

        if (!updatedAuthor) {
          throw new Error("Author not found");
        }

        return updatedAuthor;
      } catch (error) {
        console.error("error updating author:", error);
        throw new Error("Failed to update author");
      }
    },

    async deleteAuthor(_, { id }) {
      try {
        const deleted = await Author.findByIdAndDelete(id);
        if (!deleted) {
          throw new Error("Author not found");
        }
        return true;
      } catch (error) {
        console.error("Error deleting author:", error);
        throw new Error("Failed to delete author");
      }
    },
  },

  Author: {
    subscribers: async (parent) => {
      return await User.find({ _id: { $in: parent.subscribers } });
    },
  },
};
