import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";

dotenv.config();

const DEFAULT_LISTS = [
  "reading",
  "planned",
  "completed",
  "dropped",
  "favorite",
];

const run = async () => {
  try {
    await connectDB();

    const users = await User.find();

    for (const user of users) {
      const existingListNames = user.lists?.map((list) => list.name) || [];

      const missingLists = DEFAULT_LISTS.filter(
        (name) => !existingListNames.includes(name)
      );

      if (missingLists.length > 0) {
        const updatedLists = [
          ...user.lists,
          ...missingLists.map((name) => ({ name, titles: [] })),
        ];

        await User.findByIdAndUpdate(user._id, {
          $set: {
            lists: updatedLists,
          },
        });

        console.log(
          `Updated ${user.username} | Added: ${missingLists.join(", ")}`
        );
      } else {
        console.log(`⏭  Skipped ${user.username} | All lists exist`);
      }
    }

    console.log("Finished updating users.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to update users:", err.message);
    process.exit(1);
  }
};

run();
