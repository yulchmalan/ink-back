import { generateUploadUrl } from "../../lib/s3.js";

export default {
  Mutation: {
    generateUploadUrl: async (_, { folder, fileName, fileType }) => {
      return await generateUploadUrl(folder, fileName, fileType);
    },
  },
};
