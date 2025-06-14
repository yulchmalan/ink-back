export const commentTypeDefs = `#graphql
  type Score {
    likes: Int
    dislikes: Int
    likedBy: [User!]!
    dislikedBy: [User!]!
  }

  enum SubjectType {
    TITLE
    REVIEW
    COLLECTION
  }


  type Comment {
    id: ObjectID!
    user: User!
    subject_ID: ObjectID!
    title: Title
    body: String!
    parent_ID: ObjectID
    score: Score
    createdAt: DateTime
    subjectType: SubjectType!
    updatedAt: DateTime
  }

  input CreateCommentInput {
    userId: ObjectID!
    subjectId: ObjectID!
    subjectType: SubjectType!
    body: String!
    parentId: ObjectID
  }

  input EditCommentInput {
    body: String
  }

  enum CommentSortField {
    CREATED_AT
    LIKES
    DISLIKES
    RATING
  }

  enum SortOrder {
    ASC
    DESC
  }

  input CommentFilter {
    subjectId: ObjectID
    userId: ObjectID
    parentId: ObjectID
  }

  type PaginatedComments {
    total: Int!
    results: [Comment!]!
  }

  type Query {
    comments(
      filter: CommentFilter
      sortBy: CommentSortField = CREATED_AT
      sortOrder: SortOrder = DESC
      limit: Int = 10
      offset: Int = 0
    ): PaginatedComments!

    comment(id: ObjectID!): Comment
  }

  type Mutation {
    createComment(input: CreateCommentInput!): Comment
    deleteComment(id: ObjectID!): Boolean
    editComment(id: ObjectID!, edits: EditCommentInput!): Comment
    likeComment(id: ObjectID!, userId: ObjectID!): Comment
    dislikeComment(id: ObjectID!, userId: ObjectID!): Comment
    clearCommentVote(id: ObjectID!, userId: ObjectID!): Comment
  }
`;
