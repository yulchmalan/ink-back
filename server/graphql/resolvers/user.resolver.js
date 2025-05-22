import User from "../../models/user.model.js";
import Review from "../../models/review.model.js";
import Comment from "../../models/comment.model.js";
import Title from "../../models/title.model.js";

const DEFAULT_LISTS = [
  "reading",
  "planned",
  "completed",
  "dropped",
  "favorite",
];

export const userResolvers = {
  Query: {
    async users(
      _,
      {
        limit = 10,
        offset = 0,
        role,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
      }
    ) {
      try {
        const filter = {};

        if (role) filter.role = role;
        if (search) filter.username = { $regex: search, $options: "i" };

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        return await User.find(filter).sort(sort).skip(offset).limit(limit);
      } catch (error) {
        console.error("error fetching users:", error.message);
        throw new Error("Failed to fetch users");
      }
    },

    async user(_, { id }) {
      try {
        return await User.findById(id).populate("friends.user");
      } catch (error) {
        console.error("error fetching user:", error.message);
        throw new Error("Failed to fetch user");
      }
    },

    userGenreStats: async (_, { userId }) => {
      const user = await User.findById(userId).populate({
        path: "lists.titles.title",
        populate: { path: "genres" },
      });

      if (!user) throw new Error("User not found");

      const genreCounts = new Map();

      user.lists.forEach((list) => {
        list.titles.forEach(({ title }) => {
          title.genres?.forEach((genre) => {
            const key = genre._id.toString();
            if (!genreCounts.has(key)) {
              genreCounts.set(key, { name: genre.name, count: 0 });
            }
            genreCounts.get(key).count++;
          });
        });
      });

      return Array.from(genreCounts.values());
    },
  },

  Mutation: {
    async addUser(_, { user }) {
      try {
        const createdUser = await User.create({
          ...user,
          bio: user.bio || "",
          stats: {
            materialsAdded: 0,
            titlesCreated: 0,
          },
          lists: DEFAULT_LISTS.map((name) => ({ name, titles: [] })),
        });

        return createdUser;
      } catch (error) {
        console.error("Error adding user:", error.message);
        throw new Error("Failed to create user");
      }
    },

    async updateUser(_, { id, edits }) {
      try {
        const updates = {};

        if (edits.username !== undefined) updates.username = edits.username;
        if (edits.email !== undefined) updates.email = edits.email;
        if (edits.bio !== undefined) updates.bio = edits.bio;
        if (edits.exp !== undefined) updates.exp = edits.exp;
        if (edits.last_online !== undefined)
          updates.last_online = edits.last_online;
        if (edits.role !== undefined) updates.role = edits.role;

        const updatedUser = await User.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        });

        return updatedUser;
      } catch (error) {
        console.error("Error updating user:", error.message);
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

    addCustomList: async (_, { userId, input }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.lists.push({ name: input.name, titles: [] });
      await user.save();

      return user.lists;
    },

    addTitleToList: async (_, { userId, input }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const { listName, titleId, language = "uk" } = input;

      user.lists.forEach((list) => {
        list.titles = list.titles.filter(
          (entry) =>
            entry.title.toString() !== titleId || entry.language !== language
        );
      });

      const targetList = user.lists.find((l) => l.name === listName);
      if (!targetList) throw new Error("List not found");

      const alreadyExists = targetList.titles.some(
        (entry) =>
          entry.title.toString() === titleId && entry.language === language
      );

      if (!alreadyExists) {
        targetList.titles.push({
          title: titleId,
          rating: 0,
          progress: 0,
          language,
          added: new Date(),
        });
      }

      user.markModified("lists");
      await user.save();

      return user.lists;
    },

    addExpToUser: async (_, { userId, amount }) => {
      if (amount < 0) throw new Error("Experience amount must be positive");

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.exp = (user.exp || 0) + amount;
      await user.save();

      return user;
    },
    addFriend: async (_, { userId, friendId }) => {
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
      if (userId === friendId) {
        throw new Error("Cannot add yourself as a friend");
      }
      if (!user || !friend) throw new Error("User not found");

      const alreadyAdded = user.friends.some(
        (f) => f.user.toString() === friendId
      );
      const alreadyReverse = friend.friends.some(
        (f) => f.user.toString() === userId
      );

      if (!alreadyAdded) {
        user.friends.push({ user: friendId, status: "PENDING" });
      }

      if (!alreadyReverse) {
        friend.friends.push({ user: userId, status: "RECEIVED" });
      }

      await user.save();
      await friend.save();

      return user;
    },

    updateFriendStatus: async (_, { userId, friendId, newStatus }) => {
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
      if (!user || !friend) throw new Error("User not found");

      const userEntry = user.friends.find(
        (f) => f.user.toString() === friendId
      );
      const friendEntry = friend.friends.find(
        (f) => f.user.toString() === userId
      );

      if (!userEntry || !friendEntry) throw new Error("Friend entry not found");

      userEntry.status = newStatus;
      friendEntry.status = newStatus;

      await user.save();
      await friend.save();

      return user;
    },

    removeFriend: async (_, { userId, friendId }) => {
      const user = await User.findById(userId);
      const friend = await User.findById(friendId);
      if (!user || !friend) throw new Error("User not found");

      user.friends = user.friends.filter((f) => f.user.toString() !== friendId);
      friend.friends = friend.friends.filter(
        (f) => f.user.toString() !== userId
      );

      await user.save();
      await friend.save();

      return user;
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

  SavedTitle: {
    title: async (parent) => {
      if (!parent.title) return null;
      try {
        return await Title.findById(parent.title);
      } catch (err) {
        console.error("Failed to resolve SavedTitle.title:", err);
        return null;
      }
    },
  },
};
