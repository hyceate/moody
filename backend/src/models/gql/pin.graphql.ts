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
  type Board {
    id: ID
    user: User
    title: String
    description: String
    isPrivate: Boolean
  }
  type BoardRef {
    board: Board
    savedAt: String
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
    boards: [BoardRef!]
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
  type StatusResponse {
    success: Boolean!
    message: String!
  }
  type Mutation {
    createPin(input: CreatePinInput!): CreatePinResponse!
    updatePin(input: UpdatePinInput!): CreatePinResponse!
    deletePin(id: ID!): StatusResponse!
    deletePinFromBoard(pinId: ID!, boardId: ID!): StatusResponse!
    savePinToBoard(pinId: ID!, boardId: ID!): StatusResponse!
    createComment(input: CreateCommentInput!): StatusResponse!
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
  input UpdatePinInput {
    id: ID!
    user: ID!
    title: String!
    link: String
    description: String
    currentBoard: String
    newBoard: String
  }
  input CreateCommentInput {
    user: ID!
    comment: String!
    pin: ID!
  }
`;

export default pinTypeDefs;
