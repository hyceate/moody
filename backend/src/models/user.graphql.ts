import gql from 'graphql-tag';

const userTypeDefs = gql`
  type User {
    id: ID!
    role: String!
    username: String!
    email: String!
    password: String!
    avatarUrl: String
    createdAt: String!
    updatedAt: String!
  }
  type SignUpResponse {
    success: Boolean!
    message: String!
    user: User
    errorType: String
  }
  type UpdateResponse {
    success: Boolean!
    message: String!
    user: User
    errorType: String
  }
  type DeleteAccountResponse {
    success: Boolean!
    message: String!
  }
  type Query {
    users: [User!]! # Fetch all users
    user(id: ID!): User # Get a user by ID
    userByName(username: String!): User
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpResponse!
    deleteAccount(id: ID!): DeleteAccountResponse!
    updateAccount(input: UpdateInput!): UpdateResponse!
  }

  input SignUpInput {
    role: String = "user"
    username: String!
    email: String!
    password: String!
    avatarUrl: String
  }
  input UpdateInput {
    id: String!
    username: String
    email: String
    currentPassword: String
    newPassword: String
    confirmPassword: String
  }
`;

export default userTypeDefs;
