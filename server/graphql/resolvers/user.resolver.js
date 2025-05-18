import User from "../../models/user.model.js";
import Review from "../../models/review.model.js";
import Comment from "../../models/comment.model.js";
import Title from "../../models/title.model.js";

export const userResolvers = {
  Query: {
    async users(
      _,
      {
        limit = 10,
        offset = 0,
        role,
        sortBy = "created",
        sortOrder = "desc",
        search,
      }
    ) {
      try {
        const filter = {};

        if (role) filter.role = role;
        if (search) filter.username = { $regex: search, $options: "i" }; // пошук по username

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        return await User.find(filter).sort(sort).skip(offset).limit(limit);
      } catch (error) {
        console.error("error fetching users:", error.message);
        throw new Error("Failed to fetch users");
      }
    },

    async user(_, { id }) {
      try {
        return await User.findById(id);
      } catch (error) {
        console.error("error fetching user:", error.message);
        throw new Error("Failed to fetch user");
      }
    },
  },

  Mutation: {
    async addUser(_, { user }) {
      try {
        const createdUser = await User.create({
          ...user,
          created: new Date(),
        });
        return createdUser;
      } catch (error) {
        console.error("error adding user:", error.message);
        throw new Error("Failed to create user");
      }
    },

    async updateUser(_, { id, edits }) {
      try {
        const updates = {};
        if (edits.username !== undefined) updates.username = edits.username;
        if (edits.email !== undefined) updates.email = edits.email;
        if (edits.password_hash !== undefined)
          updates.password_hash = edits.password_hash;
        if (edits.settings !== undefined) updates.settings = edits.settings;
        if (edits.last_online !== undefined)
          updates.last_online = edits.last_online;
        if (edits.role !== undefined) updates.role = edits.role;

        const updatedUser = await User.findByIdAndUpdate(id, updates, {
          new: true,
        });

        if (!updatedUser) throw new Error("User not found");

        return updatedUser;
      } catch (error) {
        console.error("error updating user:", error.message);
        throw new Error("Failed to update user");
      }
    },

    async deleteUser(_, { id }) {
      try {
        const deletedUser = await User.findByIdAndDelete(id);
        return !!deletedUser;
      } catch (error) {
        console.error("error deleting user:", error.message);
        throw new Error("Failed to delete user");
      }
    },
  },

  User: {
    reviews: async (parent) => {
      return await Review.find({ _id: { $in: parent.reviews } });
    },
    comments: async (parent) => {
      return await Comment.find({ _id: { $in: parent.comments } });
    },
    recommendations: async (parent) => {
      return await Title.find({ _id: { $in: parent.recommendations } });
    },
  },
};
