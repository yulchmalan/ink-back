export const authTypeDefs = `#graphql
  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: EmailAddress!
    username: String!
    password: String!
  }

  input LoginInput {
    email: EmailAddress!
    password: String!
  }

  extend type Mutation {
    registerUser(input: RegisterInput!): AuthPayload!
    loginUser(input: LoginInput!, recaptchaToken: String): AuthPayload!
  }
`;
