import Notification from "../../models/notification.model.js";
import User from "../../models/user.model.js";
import Comment from "../../models/comment.model.js";

export const notificationResolvers = {
  Query: {
    notifications: async (_, { userId }) => {
      return await Notification.find({ recipient: userId }).sort({
        createdAt: -1,
      });
    },
  },

  Mutation: {
    markNotificationRead: async (_, { id }) => {
      const notif = await Notification.findById(id);
      if (!notif) return false;
      notif.read = true;
      await notif.save();
      return true;
    },
  },

  Notification: {
    recipient: async (parent) => await User.findById(parent.recipient),
    sender: async (parent) =>
      parent.sender ? await User.findById(parent.sender) : null,
    subject: async (parent) => {
      return await Comment.findById(parent.subjectId); // subjectId має містити ID коментаря
    },
    subjectType: async (parent) => {
      if (!parent.subjectId) return null;
      const comment = await Comment.findById(parent.subjectId);
      return comment?.subjectType || null;
    },
  },
};
