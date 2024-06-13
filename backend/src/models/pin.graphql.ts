import gql from 'graphql-tag';

const pinTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
  }
  type Comment {
    id: ID!
    user: User!
    comment: String!
    commentTime: String
  }

  type Pin {
    id: ID
    title: String
    description: String
    imgPath: String
    createdAt: String
    user: User
    tags: [String!]
    private: Boolean
    link: String
    comments: [Comment!]
    board: [String!]
  }
  input PinsSortInput {
    field: String!
    direction: SortDirection!
  }

  enum SortDirection {
    ASC
    DESC
  }
  type Query {
    pins(sort: PinsSortInput): [Pin!]!
    pinsByUser(id: ID!): [Pin!]
    pin(id: ID!): Pin
  }

  type CreatePinResponse {
    success: Boolean!
    message: String!
    pin: Pin
  }
  type DeletePinResponse {
    success: Boolean!
    message: String!
  }
  type CreateCommentResponse {
    success: Boolean!
    message: String!
    comment: Comment
  }
  type Mutation {
    createPin(input: CreatePinInput!): CreatePinResponse!
    deletePin(id: ID!): DeletePinResponse!
    createComment(input: CreateCommentInput!): CreateCommentResponse!
  }

  input CreatePinInput {
    user: ID!
    title: String!
    description: String
    imgPath: String!
    tags: [String!]
    private: Boolean! = false
    link: String
    board: [String!] = default
  }
  input CreateCommentInput {
    user: ID!
    comment: String!
    pin: ID!
  }
`;

export default pinTypeDefs;
