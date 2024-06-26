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
    imgWidth: Int
    imgHeight: Int
    createdAt: String
    user: User
    tags: [String!]
    isPrivate: Boolean
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
    pinsByUser(userid: ID!, sort: Int): [Pin!]
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
  type SavePinToBoardResponse {
    success: Boolean!
    message: String!
  }
  type Mutation {
    createPin(input: CreatePinInput!): CreatePinResponse!
    deletePin(id: ID!): DeletePinResponse!
    savePinToBoard(pinId: ID!, boardId: ID!): SavePinToBoardResponse!
    createComment(input: CreateCommentInput!): CreateCommentResponse!
  }

  input CreatePinInput {
    user: ID!
    title: String!
    description: String
    imgPath: String!
    imgWidth: Int!
    imgHeight: Int!
    tags: [String!]
    isPrivate: Boolean! = false
    link: String
    board: String
  }
  input CreateCommentInput {
    user: ID!
    comment: String!
    pin: ID!
  }
`;

export default pinTypeDefs;
