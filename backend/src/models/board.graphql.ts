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
    boardsByUser(userId: ID!): [Board!]
    boardsByUsernameTitle(username: String!, url: String!): [Board!]
    pinsByUserBoards(userId: ID!): [Pin!]
  }
  type CreateBoardResponse {
    success: Boolean!
    message: String!
    board: Board
  }
  type DeleteBoardResponse {
    success: Boolean!
    message: String!
  }
  type Mutation {
    createBoard(input: CreateBoardInput!): CreateBoardResponse!
    updateBoard(input: CreateBoardInput!): CreateBoardResponse!
    deleteBoard(boardId: ID!): DeleteBoardResponse!
  }

  input CreateBoardInput {
    title: String!
    description: String
    user: ID!
    isPrivate: Boolean!
  }
`;

export default boardTypeDefs;
