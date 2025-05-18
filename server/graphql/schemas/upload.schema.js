export const uploadTypeDefs = `#graphql
  type UploadPayload {
    uploadUrl: String!
    key: String!
  }

  extend type Mutation {
    generateUploadUrl(
      folder: String!
      fileName: String!
      fileType: String!
    ): UploadPayload!
  }
`;
