export const notificationTypeDefs = `#graphql
  enum NotificationType {
    REPLY
    FRIEND_REQUEST
    FRIEND_ACCEPTED
  }

  enum SubjectType {
    TITLE
    REVIEW
    COLLECTION
  }

  type Notification {
    _id: ObjectID!
    recipient: User!
    sender: User
    type: NotificationType!
    subjectId: ObjectID
    subjectType: SubjectType
    read: Boolean!
    subject: Comment
    createdAt: DateTime!
  }

  type Query {
    notifications(userId: ObjectID!): [Notification!]!
  }

  type Mutation {
    markNotificationRead(id: ObjectID!): Boolean
  }
`;
