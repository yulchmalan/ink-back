export const collectionTypeDefs = `#graphql
    type Score {
        likes: Int
        dislikes: Int
        likedBy: [User!]!
        dislikedBy: [User!]!
    }

    type Collection {
        id: ObjectID!
        name: String!
        description: String
        user: User!
        titles: [Title!]!
        views: Int
        score: Score
        createdAt: DateTime
        updatedAt: DateTime
    }

    enum CollectionSortField {
        CREATED_AT
        LIKES
        RATING
    }

    input CreateCollectionInput {
        name: String!
        description: String
        userId: ObjectID!
        titleIds: [ObjectID!]!
    }

    input EditCollectionInput {
        name: String
        description: String
        titleIds: [ObjectID!]
    }

    input CollectionFilter {
        userId: ObjectID
        name: String
    }

    type PaginatedCollections {
        total: Int!
        results: [Collection!]!
    }

    type Query {
        collections(
            filter: CollectionFilter
            sortBy: CollectionSortField = CREATED_AT
            sortOrder: SortOrder = DESC
            limit: Int = 10
            offset: Int = 0
            search: String
        ): PaginatedCollections!
        collection(id: ObjectID!): Collection
    }


    type Mutation {
        createCollection(input: CreateCollectionInput!): Collection
        editCollection(id: ObjectID!, edits: EditCollectionInput!): Collection
        deleteCollection(id: ObjectID!): Boolean
        likeCollection(id: ObjectID!, userId: ObjectID!): Collection!
        dislikeCollection(id: ObjectID!, userId: ObjectID!): Collection!
        clearCollectionVote(id: ObjectID!, userId: ObjectID!): Collection!
        incrementCollectionViews(id: ObjectID!): Collection!
        addTitleToCollection(collectionId: ObjectID!, titleId: ObjectID!): Collection
        removeTitleFromCollection(collectionId: ObjectID!, titleId: ObjectID!): Collection
    }
`;
