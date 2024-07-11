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
    user: ID!
    pinId: String
    commentId: String
    comment: String!
  }

  input DeleteCommentInput {
    pinId: String!
    commentId: String!
  }

  type StatusResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    addComment(input: CommentInput!): StatusResponse!
    updateComment(input: CommentInput!): StatusResponse!
    deleteComment(input: DeleteCommentInput): StatusResponse!
  }
`;

export default commentTypeDefs;
