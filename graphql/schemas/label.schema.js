export const labelTypeDefs = `#graphql
  enum LabelType {
    TAG
    GENRE
  }

  enum LabelSortField {
    NAME
    CREATED_AT
  }

  enum SortOrder {
    ASC
    DESC
  }

  input LabelFilter {
    type: LabelType
    nameContains: String
  }

  type Label {
    id: ObjectID!
    name: String!
    type: LabelType!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type PaginatedLabels {
    total: Int!
    results: [Label!]!
  }

  type Query {
    labels(
      filter: LabelFilter
      sortBy: LabelSortField = CREATED_AT
      sortOrder: SortOrder = DESC
      limit: Int = 10
      offset: Int = 0
    ): PaginatedLabels!

    labelsByType(type: LabelType!): [Label]
  }

  type Mutation {
    createLabel(name: String!, type: LabelType!): Label
    updateLabel(id: ObjectID!, name: String, type: LabelType): Label
    deleteLabel(id: ObjectID!): Boolean
  }
`;
