// server/utils/removeAllListFromUsers.js
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const users = await User.find();

    for (const user of users) {
      const originalLists = user.lists || [];
      const hasAllList = originalLists.some((list) => list.name === "all");

      if (hasAllList) {
        const updatedLists = originalLists.filter(
          (list) => list.name !== "all"
        );

        await User.findByIdAndUpdate(user._id, {
          $set: { lists: updatedLists },
        });

        console.log(`Removed 'all' from ${user.username}`);
      } else {
        console.log(`Skipped ${user.username} | No 'all' list`);
      }
    }

    console.log("Finished cleaning up users");
    process.exit(0);
  } catch (err) {
    console.error("Failed to remove 'all' list:", err.message);
    process.exit(1);
  }
};

run();
