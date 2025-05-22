export const userTypeDefs = `#graphql
  scalar Password

  enum Role {
    USER
    MODERATOR
    ADMIN
    OWNER
  }

  enum FriendStatus {
    PENDING
    ACCEPTED
    RECEIVED
  }

  type SavedTitle {
    title: Title
    rating: Int
    last_open: DateTime
    added: DateTime
    progress: Int
    language: String
  }

  type List {
    name: String
    titles: [SavedTitle]
  }

  type Friend {
    user: User
    status: FriendStatus
  }

  type UserStats {
    materialsAdded: Int!
    titlesCreated: Int!
  }

  type User {
    _id: ObjectID!
    username: String
    email: EmailAddress
    password_hash: Password
    bio: String
    stats: UserStats
    createdAt: DateTime
    updatedAt: DateTime
    last_online: DateTime
    lists: [List]
    friends: [Friend!]
    reviews: [Review!]
    comments: [Comment!]
    recommendations: [Title!]
    exp: Int
    role: Role
  }

  input AddUserInput {
    username: String!
    email: EmailAddress!
    password_hash: Password!
    bio: String
  }

  input EditUserInput {
    username: String
    email: EmailAddress
    password_hash: Password
    bio: String
    last_online: DateTime
    role: Role
    updatedAt: DateTime
  }

  input EditListInput {
    name: String!
    titles: [EditSavedTitleInput!]
  }

  input EditSavedTitleInput {
    title: ObjectID!
    rating: Int
    last_open: DateTime
    added: DateTime
    progress: Int
    language: String
  }

  input NewListInput {
    name: String!
  }

  input AddTitleToListInput {
    listName: String!
    titleId: ObjectID!
    language: String 
  }

  type LabelName {
    en: String
    ua: String
    pl: String
  }

  type GenreStat {
    name: LabelName
    count: Int
  }

  type Query {
    users(
      limit: Int = 10
      offset: Int = 0
      role: Role
      sortBy: String = "created"
      sortOrder: String = "desc"
      search: String
    ): [User]
    user(id: ObjectID!): User
    userGenreStats(userId: ObjectID!): [GenreStat!]!
  }

  type Mutation {
    addUser(user: AddUserInput!): User
    updateUser(id: ObjectID!, edits: EditUserInput!): User
    deleteUser(id: ObjectID!): Boolean

    addCustomList(userId: ObjectID!, input: NewListInput!): [List]
    addTitleToList(userId: ObjectID!, input: AddTitleToListInput!): [List]

    addExpToUser(userId: ObjectID!, amount: Int!): User

    addFriend(userId: ObjectID!, friendId: ObjectID!, status: FriendStatus!): User
    updateFriendStatus(userId: ObjectID!, friendId: ObjectID!, newStatus: FriendStatus!): User
    removeFriend(userId: ObjectID!, friendId: ObjectID!): User
  }
`;
