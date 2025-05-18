export const authorTypeDefs = `#graphql
  scalar ObjectID

  type Author {
    id: ObjectID!
    name: String!
    alt_names: [String]
    bio: String
    subscribers: [User]
    photo: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  input AuthorFilterInput {
    name: String
    alt_name: String
  }

  enum AuthorSortField {
    NAME
    CREATED_AT
  }

  enum SortDirection {
    ASC
    DESC
  }

  input AuthorSortInput {
    field: AuthorSortField!
    direction: SortDirection!
  }

  type AuthorQueryResult {
    total: Int!
    results: [Author!]!
  }

  type Query {
    authors(
      filter: AuthorFilterInput
      sort: AuthorSortInput
      limit: Int
      offset: Int
    ): AuthorQueryResult!
    
    getAuthor(id: ObjectID!): Author
  }

  type Mutation {
    createAuthor(
      name: String!
      alt_names: [String]
      bio: String
      photo: String
    ): Author

    updateAuthor(
      id: ObjectID!
      name: String
      alt_names: [String]
      bio: String
      photo: String
    ): Author

    deleteAuthor(id: ObjectID!): Boolean
  }
`;
