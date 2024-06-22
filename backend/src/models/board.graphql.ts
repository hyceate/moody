import gql from 'graphql-tag';

const boardTypeDefs = gql`
  type Board {
    user: User
    id: ID
    title: String
    description: String
    url: String
    followers: [User]
    pins: [Pin]
    pinCount: Int
    isPrivate: Boolean
  }

  type Query {
    board(id: ID!): Board # Get a board by ID
    boardsByUser(userId: ID!): [Board!] # Fetch all boards by userID
    boardsByUserName(username: String!): [Board!]
    boardsByUsernameTitle(username: String!, url: String!): [Board!]
    allBoards: [Board!]!
    pinsByUserBoards(userId: ID!): [Pin!]
  }
  type CreateBoardResponse {
    success: Boolean!
    message: String!
    board: Board
  }
  type Mutation {
    createBoard(input: CreateBoardInput!): CreateBoardResponse!
    updateBoard(input: CreateBoardInput!): CreateBoardResponse!
    deleteBoard(boardId: ID!): Boolean!
  }

  input CreateBoardInput {
    title: String!
    description: String
    user: ID!
    isPrivate: Boolean!
  }
`;

export default boardTypeDefs;
