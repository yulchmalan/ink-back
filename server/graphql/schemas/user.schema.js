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
    REJECTED
  }

  type SavedTitle {
    title: Title
    rating: Int
    last_open: DateTime
    progress: Int
  }

  type List {
    name: String
    titles: [SavedTitle]
  }

  type Friend {
    user: User
    status: FriendStatus
  }

  type Settings {
    bio: String
    pfp: String
    banner: String
  }

  type User {
    _id: ObjectID!
    username: String
    email: EmailAddress
    password_hash: Password
    settings: Settings
    created: DateTime
    last_online: DateTime
    lists: [List]
    friends: [Friend!]
    reviews: [Review!]
    comments: [Comment!]
    recommendations: [Title!]
    role: Role
  }

  input AddSettingsInput {
    bio: String
    pfp: String
    banner: String
  }

  input AddUserInput {
    username: String!
    email: EmailAddress!
    password_hash: Password!
    settings: AddSettingsInput
  }

  input EditSettingsInput {
    bio: String
    pfp: String
    banner: String
  }

  input EditUserInput {
    username: String
    email: EmailAddress
    password_hash: Password
    settings: EditSettingsInput
    last_online: DateTime
    role: Role
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
  }

  type Mutation {
    addUser(user: AddUserInput!): User
    updateUser(id: ObjectID!, edits: EditUserInput!): User
    deleteUser(id: ObjectID!): Boolean
  }
`;
