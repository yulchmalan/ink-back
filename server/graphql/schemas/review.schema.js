export const reviewTypeDefs = `#graphql
  type Score {
    likes: Int
    dislikes: Int
    likedBy: [User!]!
    dislikedBy: [User!]!
  }

  type Review {
    id: ObjectID!
    name: String!
    body: String!
    rating: Int
    views: Int
    score: Score
    user: User!
    title: Title!
    comments: [Comment!]!
    createdAt: DateTime
    updatedAt: DateTime
  }

  input CreateReviewInput {
    name: String!
    body: String!
    rating: Int
    userId: ObjectID!
    titleId: ObjectID!
  }

  input EditReviewInput {
    name: String
    body: String
    rating: Int
  }

  input ReviewFilter {
    userId: ObjectID
    titleId: ObjectID
    minRating: Int
    maxRating: Int
  }

  enum ReviewSortField {
    CREATED_AT
    RATING
    VIEWS
  }

  enum SortOrder {
    ASC
    DESC
  }

  type PaginatedReviews {
    total: Int!
    results: [Review!]!
  }

  type Query {
    reviews(
      filter: ReviewFilter
      sortBy: ReviewSortField = CREATED_AT
      sortOrder: SortOrder = DESC
      limit: Int = 10
      offset: Int = 0
      search: String
    ): PaginatedReviews!

    review(id: ObjectID!): Review
  }

  type Mutation {
    createReview(input: CreateReviewInput!): Review
    deleteReview(id: ObjectID!): Boolean
    editReview(id: ObjectID!, edits: EditReviewInput!): Review
    likeReview(id: ObjectID!, userId: ObjectID!): Review
    dislikeReview(id: ObjectID!, userId: ObjectID!): Review
    clearReviewVote(id: ObjectID!, userId: ObjectID!): Review
    incrementReviewViews(id: ObjectID!): Review
  }
`;
