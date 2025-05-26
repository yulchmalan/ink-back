import User from "../../models/user.model.js";
import Review from "../../models/review.model.js";
import Comment from "../../models/comment.model.js";
import Title from "../../models/title.model.js";
import TitleRating from "../../models/titleRating.model.js";

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
        const user = await User.findById(id);
        if (!user) throw new Error("User not found");

        if (edits.username !== undefined) user.username = edits.username;
        if (edits.email !== undefined) user.email = edits.email;
        if (edits.bio !== undefined) user.bio = edits.bio;
        if (edits.exp !== undefined) user.exp = edits.exp;
        if (edits.last_online !== undefined)
          user.last_online = edits.last_online;
        if (edits.role !== undefined) user.role = edits.role;

        if (edits.lists?.length) {
          for (const listEdit of edits.lists) {
            const editedTitles = listEdit.titles || [];

            for (const editedTitle of editedTitles) {
              for (const list of user.lists) {
                const entry = list.titles.find(
                  (t) => t.title.toString() === editedTitle.title.toString()
                );
                if (!entry) continue;

                if (editedTitle.progress !== undefined)
                  entry.progress = editedTitle.progress;
                if (editedTitle.rating !== undefined)
                  entry.rating = editedTitle.rating;
                if (editedTitle.last_open !== undefined)
                  entry.last_open = editedTitle.last_open;
                if (editedTitle.language !== undefined)
                  entry.language = editedTitle.language;
              }
            }
          }

          user.markModified("lists");
        }

        await user.save();
        return user;
      } catch (error) {
        console.error("Error updating user:", error.message, error.stack);
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

      let savedEntry = null;

      user.lists.forEach((list) => {
        const index = list.titles.findIndex(
          (entry) =>
            entry.title.toString() === titleId && entry.language === language
        );

        if (index !== -1) {
          savedEntry = list.titles[index];
          list.titles.splice(index, 1);
        }
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
          rating: savedEntry?.rating ?? 0,
          progress: savedEntry?.progress ?? 0,
          added: savedEntry?.added ?? new Date(),
          language,
        });
      }

      user.markModified("lists");
      await user.save();

      return user.lists;
    },

    removeTitleFromLists: async (_, { userId, titleId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.lists.forEach((list) => {
        list.titles = list.titles.filter((t) => t.title.toString() !== titleId);
      });

      user.markModified("lists");
      await user.save();
      return user.lists;
    },

    updateTitleRating: async (
      _,
      { userId, titleId, rating, language = "uk" }
    ) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      let found = false;

      for (const list of user.lists) {
        for (const entry of list.titles) {
          if (
            entry.title.toString() === titleId &&
            entry.language === language
          ) {
            entry.rating = rating;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) throw new Error("Title not found in user lists");

      user.markModified("lists");
      await user.save();

      // ⬇️ Додано: оновлення середнього рейтингу
      const allUsers = await User.find({ "lists.titles.title": titleId });

      let sum = 0;
      let count = 0;

      allUsers.forEach((u) => {
        u.lists.forEach((list) => {
          list.titles.forEach((t) => {
            if (
              t.title.toString() === titleId &&
              typeof t.rating === "number"
            ) {
              sum += t.rating;
              count++;
            }
          });
        });
      });

      const avg = count ? Math.round((sum / count) * 10) / 10 : 0;

      await TitleRating.findOneAndUpdate(
        { titleId },
        { avgRating: avg, ratingCount: count },
        { upsert: true, new: true }
      );

      return true;
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
