import ReportType from "../../models/report-type.model.js";

export const reportTypeResolvers = {
  Query: {
    async reportTypes(
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

        if (filter.titleContains) {
          query.title = { $regex: filter.titleContains, $options: "i" };
        }

        const sortMap = {
          TITLE: "title",
          CREATED_AT: "createdAt",
        };

        const sortField = sortMap[sortBy] || "createdAt";
        const sortDirection = sortOrder === "ASC" ? 1 : -1;

        const total = await ReportType.countDocuments(query);
        const results = await ReportType.find(query)
          .sort({ [sortField]: sortDirection })
          .skip(offset)
          .limit(limit);

        return { total, results };
      } catch (error) {
        console.error("error fetching reportTypes:", error.message);
        throw new Error("Failed to fetch report types");
      }
    },

    async reportType(_, { id }) {
      try {
        return await ReportType.findById(id);
      } catch (error) {
        console.error("error fetching reportType:", error.message);
        throw new Error("Failed to fetch report type");
      }
    },
  },

  Mutation: {
    async createReportType(_, { input }) {
      try {
        const newReportType = await ReportType.create(input);
        return newReportType;
      } catch (error) {
        console.error("error creating report type:", error.message);
        throw new Error("Failed to create report type");
      }
    },

    async deleteReportType(_, { id }) {
      try {
        const deleted = await ReportType.findByIdAndDelete(id);
        return !!deleted;
      } catch (error) {
        console.error("error deleting report type:", error.message);
        throw new Error("Failed to delete report type");
      }
    },
  },
};
