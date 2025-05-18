export const reportTypeTypeDefs = `#graphql
  enum ReportTypeSortField {
    TITLE
    CREATED_AT
  }

  enum SortOrder {
    ASC
    DESC
  }

  input ReportTypeFilter {
    titleContains: String
  }

  input CreateReportTypeInput {
    title: String!
  }

  type ReportType {
    id: ObjectID!
    title: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type PaginatedReportTypes {
    total: Int!
    results: [ReportType!]!
  }

  type Query {
    reportTypes(
      filter: ReportTypeFilter
      sortBy: ReportTypeSortField = CREATED_AT
      sortOrder: SortOrder = DESC
      limit: Int = 10
      offset: Int = 0
    ): PaginatedReportTypes!

    reportType(id: ObjectID!): ReportType
  }

  type Mutation {
    createReportType(input: CreateReportTypeInput!): ReportType
    deleteReportType(id: ObjectID!): Boolean
  }
`;
