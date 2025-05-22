import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const users = await User.find({ exp: { $exists: false } });

    if (users.length === 0) {
      console.log("У всіх користувачів вже є поле exp");
      return process.exit(0);
    }

    for (const user of users) {
      await User.findByIdAndUpdate(user._id, { $set: { exp: 0 } });
      console.log(`Додано exp для користувача ${user.username}`);
    }

    console.log("Завершено додавання поля exp.");
    process.exit(0);
  } catch (err) {
    console.error("Помилка при оновленні користувачів:", err.message);
    process.exit(1);
  }
};

run();
