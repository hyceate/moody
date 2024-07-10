import gql from 'graphql-tag';

const commentTypeDefs = gql`
  type Comment {
    id: ID
    user: User
    comment: String
    pin: Pin
    createdAt: String
  }

  type Query {
    getAllComments(pinId: ID!): [Comment!]!
  }

  input CommentInput {
    user: ID
    pinId: String
    comment: String
  }

  type StatusResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    addComment(input: CommentInput!): StatusResponse!
    removeComment(pinId: ID!, commentId: ID!): StatusResponse!
  }
`;

export default commentTypeDefs;
