// utils/recommend.js
import mongoose from "mongoose";
import Title from "../models/title.model.js";
import User from "../models/user.model.js";

/**
 * Генерує рекомендації для користувача на основі жанрових вподобань
 * @param {string} userId
 * @param {number} topN - кількість рекомендацій
 * @returns {Promise<string[]>} - масив ID рекомендованих тайтлів
 */
export async function getRecommendations(userId, topN = 15) {
  const user = await User.findById(userId).populate({
    path: "lists.titles.title",
    populate: {
      path: "genres",
    },
  });

  if (!user || !user.lists) return [];

  const seenTitleIds = new Set();
  const genreFreq = new Map();

  for (const list of user.lists) {
    for (const entry of list.titles) {
      const id = entry.title?._id?.toString?.();
      if (id) seenTitleIds.add(id);

      if (
        typeof entry.rating === "number" &&
        entry.rating >= 6 &&
        entry.title?.genres?.length
      ) {
        for (const genre of entry.title.genres) {
          const genreId = genre._id.toString();
          genreFreq.set(genreId, (genreFreq.get(genreId) || 0) + 1);
        }
      }
    }
  }

  if (genreFreq.size === 0) return [];

  const topGenres = [...genreFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => new mongoose.Types.ObjectId(id));

  const candidates = await Title.find({
    genres: { $in: topGenres },
    _id: { $nin: Array.from(seenTitleIds) },
  }).populate("genres");

  // Можеш змінити сортування, наприклад, за рейтингом
  return candidates
    .sort(() => 0.5 - Math.random()) // або сортувати за custom критеріями
    .slice(0, topN)
    .map((t) => t._id.toString());
}
