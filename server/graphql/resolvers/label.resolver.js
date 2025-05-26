import Label from "../../models/label.model.js";

export const labelResolvers = {
  Query: {
    async labels(
      _,
      {
        filter = {},
        sortBy = "CREATED_AT",
        sortOrder = "DESC",
        limit = 10,
        offset = 0,
      }
    ) {
      try {
        const query = {};
        if (filter.type) query.type = filter.type;
        if (filter.nameContains)
          query.name = { $regex: filter.nameContains, $options: "i" };

        const sortFieldMap = {
          NAME: "name",
          CREATED_AT: "createdAt",
        };
        const sortField = sortFieldMap[sortBy] || "createdAt";
        const direction = sortOrder === "ASC" ? 1 : -1;

        const total = await Label.countDocuments(query);
        const results = await Label.find(query)
          .sort({ [sortField]: direction })
          .skip(offset)
          .limit(limit);

        return { total, results };
      } catch (error) {
        console.error("error fetching labels:", error);
        throw new Error("Failed to fetch labels");
      }
    },

    async labelsByType(_, { type }, __, info) {
      try {
        const locale = info?.variableValues?.locale ?? "uk";

        const sortField = `name.${locale}`;
        return await Label.find({ type }).sort({ [sortField]: 1 });
      } catch (error) {
        console.error("error filtering labels:", error);
        throw new Error("Failed to fetch labels by type");
      }
    },
  },

  Mutation: {
    async createLabel(_, { name, type }) {
      try {
        const existing = await Label.findOne({ "name.en": name.en, type });
        if (existing)
          throw new Error("Label with same name (EN) and type exists");
        return await Label.create({ name, type });
      } catch (error) {
        console.error("error creating label:", error);
        throw new Error("Failed to create label");
      }
    },

    async updateLabel(_, { id, name, type }) {
      try {
        const updates = {};
        if (name) updates.name = name;
        if (type !== undefined) updates.type = type;

        const updated = await Label.findByIdAndUpdate(id, updates, {
          new: true,
        });
        if (!updated) throw new Error("Label not found");
        return updated;
      } catch (error) {
        console.error("error updating label:", error);
        throw new Error("Failed to update label");
      }
    },

    async deleteLabel(_, { id }) {
      try {
        const deleted = await Label.findByIdAndDelete(id);
        if (!deleted) throw new Error("Label not found");
        return true;
      } catch (error) {
        console.error("error deleting label:", error);
        throw new Error("Failed to delete label");
      }
    },
  },
};
