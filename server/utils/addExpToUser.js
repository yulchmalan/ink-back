import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Comment from "../models/comment.model.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const comments = await Comment.find({ subjectType: { $exists: false } });

    if (comments.length === 0) {
      console.log("У всіх коментарів вже є поле subjectType");
      return process.exit(0);
    }

    for (const comment of comments) {
      await Comment.findByIdAndUpdate(comment._id, {
        $set: { subjectType: "TITLE" },
      });
      console.log(`Оновлено comment ${comment._id}`);
    }

    console.log("Завершено додавання поля subjectType.");
    process.exit(0);
  } catch (err) {
    console.error("Помилка при оновленні коментарів:", err.message);
    process.exit(1);
  }
};

run();
