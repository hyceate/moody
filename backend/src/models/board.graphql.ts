import gql from 'graphql-tag';

const boardTypeDefs = gql`
  type Board {
    user: User # Reference to the owner of the board
    id: ID
    title: String
    description: String
    followers: [User] # Array of users following the board
    pins: [Pin] # Array of references to pins on the board
    pinCount: Int
    private: Boolean
  }

  type Query {
    board(id: ID!): Board # Get a board by ID
    boardsByUser(userId: ID!): [Board!] # Fetch all boards by userID
    boardsByUserName(username: String!): [Board!]
    boardsByUsernameTitle(username: String!, title: String!): [Board!]
    allBoards: [Board!]!
  }
  type CreateBoardResponse {
    success: Boolean!
    message: String!
    board: Board
  }
  type Mutation {
    createBoard(input: CreateBoardInput!): CreateBoardResponse!
    deleteBoard(boardId: ID!): Boolean!
  }

  input CreateBoardInput {
    title: String!
    description: String
    user: ID! # Reference to the user creating the board
    private: Boolean!
  }
`;

export default boardTypeDefs;
