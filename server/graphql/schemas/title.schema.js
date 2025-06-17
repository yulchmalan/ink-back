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

  enum TitleType {
    COMIC
    NOVEL
  }

  enum TitleSortField {
    NAME
    CREATED_AT
    RATING
  }

  enum SortDirection {
    ASC
    DESC
  }

  type AltName {
    lang: String!
    value: String!
  }

  input AltNameInput {
    lang: String!
    value: String!
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
    alt_names: [AltName]            
    genres: [Label]
    tags: [Label]
    createdAt: DateTime
    updatedAt: DateTime
    type: TitleType
    chapterCount: Int
  }

  input CreateTitleInput {
    name: String!
    description: String
    authorId: ObjectID!
    cover: String
    franchise: String
    translation: Translation
    status: Status
    alt_names: [AltNameInput]       
    genreIds: [ObjectID]
    tagIds: [ObjectID]
    type: TitleType!
  }

  input UpdateTitleInput {
    name: String
    description: String
    authorId: ObjectID
    cover: String
    franchise: String
    translation: Translation
    status: Status
    alt_names: [AltNameInput]      
    genreIds: [ObjectID]
    tagIds: [ObjectID]
    type: TitleType
  }

  input TitleFilterInput {
    name: String
    franchise: String
    translation: Translation
    status: Status
    genreIds: [ObjectID]
    tagIds: [ObjectID]
    type: TitleType
    rating: RatingRange
    list: [String]
  }

  input RatingRange {
    gte: Float
    lte: Float
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
    titles(filter: TitleFilterInput, sort: TitleSortInput, limit: Int, offset: Int, userId: ObjectID, list: String): TitleQueryResult!
    popularTitles(limit: Int = 15): [Title!]!
    recommendedTitles(userId: ObjectID!): [Title!]!
    getTitle(id: ObjectID!): Title
  }

  type Mutation {
    createTitle(input: CreateTitleInput!): Title
    updateTitle(id: ObjectID!, input: UpdateTitleInput!): Title
    deleteTitle(id: ObjectID!): Boolean
  }
`;
