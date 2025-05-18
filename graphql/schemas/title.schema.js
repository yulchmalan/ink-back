export const titleTypeDefs = `#graphql
scalar ObjectID

enum Translation {
  TRANSLATED
  IN_PROGRESS
  NOT_TRANSLATED
}

enum Status {
  COMPLETED
  ONGOING
  ANNOUNCED
}

enum TitleSortField {
  NAME
  CREATED_AT
}

enum SortDirection {
  ASC
  DESC
}

type Content {
  volume: Int
  chapter: Int
  path: String
}

type Title {
  id: ObjectID!
  name: String!
  description: String
  author: Author             
  cover: String
  franchise: String
  translation: Translation
  status: Status
  alt_names: [String]
  content: Content
  genres: [Label]
  tags: [Label]
  createdAt: DateTime
  updatedAt: DateTime
}

input CreateTitleInput {
  name: String!
  description: String
  authorId: ObjectID!
  cover: String
  franchise: String
  translation: Translation
  status: Status
  alt_names: [String]
  content: ContentInput
  genreIds: [ObjectID]
  tagIds: [ObjectID]
}

input UpdateTitleInput {
  name: String
  description: String
  authorId: ObjectID
  cover: String
  franchise: String
  translation: Translation
  status: Status
  alt_names: [String]
  content: ContentInput
  genreIds: [ObjectID]
  tagIds: [ObjectID]
}

input ContentInput {
  volume: Int
  chapter: Int
  path: String
}

input TitleFilterInput {
  name: String
  franchise: String
  translation: Translation
  status: Status
}

input TitleSortInput {
  field: TitleSortField!
  direction: SortDirection!
}

type TitleQueryResult {
  total: Int!
  results: [Title!]!
}

type Query {
  titles(
    filter: TitleFilterInput
    sort: TitleSortInput
    limit: Int
    offset: Int
  ): TitleQueryResult!
  
  getTitle(id: ObjectID!): Title
}

type Mutation {
  createTitle(input: CreateTitleInput!): Title
  updateTitle(id: ObjectID!, input: UpdateTitleInput!): Title
  deleteTitle(id: ObjectID!): Boolean
}`;
