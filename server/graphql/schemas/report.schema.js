export const reportTypeDefs = `#graphql
  enum ReportStatus {
    SENDED
    REVIEWED
    RESOLVED
  }

  enum ReportSortField {
    CREATED_AT
    STATUS
  }

  enum SortOrder {
    ASC
    DESC
  }

  input ReportFilter {
    status: ReportStatus
    userId: ObjectID
    reasonId: ObjectID
  }

  input CreateReportInput {
    userId: ObjectID!
    subjectId: ObjectID!
    reasonId: ObjectID!
    body: String!
  }

  type Report {
    id: ObjectID!
    user: User!
    subject_ID: ObjectID!
    reason: ReportType!
    body: String!
    status: ReportStatus!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type PaginatedReports {
    total: Int!
    results: [Report!]!
  }

  type Query {
    reports(
      filter: ReportFilter
      sortBy: ReportSortField = CREATED_AT
      sortOrder: SortOrder = DESC
      limit: Int = 10
      offset: Int = 0
    ): PaginatedReports!

    report(id: ObjectID!): Report
  }

  type Mutation {
    createReport(input: CreateReportInput!): Report
    updateReportStatus(id: ObjectID!, status: ReportStatus!): Report
    deleteReport(id: ObjectID!): Boolean
  }
`;
