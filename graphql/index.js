import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

import {
  resolvers as scalarResolvers,
  typeDefs as scalarTypeDefs,
} from "graphql-scalars";
import { titleTypeDefs } from "./schemas/title.schema.js";
import { authorTypeDefs } from "./schemas/author.schema.js";
import { reviewTypeDefs } from "./schemas/review.schema.js";
import { reportTypeDefs } from "./schemas/report.schema.js";
import { reportTypeTypeDefs } from "./schemas/report-type.schema.js";
import { labelTypeDefs } from "./schemas/label.schema.js";
import { commentTypeDefs } from "./schemas/comment.schema.js";
import { userTypeDefs } from "./schemas/user.schema.js";
import { userResolvers } from "./resolvers/user.resolver.js";
import { authorResolvers } from "./resolvers/author.resolver.js";
import { labelResolvers } from "./resolvers/label.resolver.js";
import { titleResolvers } from "./resolvers/title.resolver.js";
import { reportTypeResolvers } from "./resolvers/report-type.resolver.js";
import { reportResolvers } from "./resolvers/report.resolver.js";
import { commentResolvers } from "./resolvers/comment.resolver.js";
import { reviewResolvers } from "./resolvers/review.resolver.js";
import { authTypeDefs } from "./schemas/auth.schema.js";
import { authResolvers } from "./resolvers/auth.resolver.js";
import uploadResolver from "./resolvers/upload.resolver.js";
import { uploadTypeDefs } from "./schemas/upload.schema.js";

const typeDefs = mergeTypeDefs([
  ...scalarTypeDefs,
  titleTypeDefs,
  authorTypeDefs,
  reviewTypeDefs,
  reportTypeDefs,
  reportTypeTypeDefs,
  labelTypeDefs,
  commentTypeDefs,
  userTypeDefs,
  authTypeDefs,
  uploadTypeDefs,
]);

const resolvers = mergeResolvers([
  scalarResolvers,
  userResolvers,
  authorResolvers,
  labelResolvers,
  titleResolvers,
  reportTypeResolvers,
  reportResolvers,
  commentResolvers,
  reviewResolvers,
  authResolvers,
  uploadResolver,
]);

export { typeDefs, resolvers };
