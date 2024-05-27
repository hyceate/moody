import gql from 'graphql-tag';

const pinTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
  }
  type Comment {
    user: User! # Ref to the comment poster
    comment: String! # The content of the comment
    commentTime: String! # Timestamp of the comment
  }

  type Pin {
    id: ID
    title: String
    description: String
    imgPath: String
    createdAt: String # Assuming createdAt is a date string
    user: User # Reference to the owner of the pin
    savedBy: [User!] # Array of users who saved the pin
    tags: [String!] # Array of tags
    private: Boolean
    link: String
    comments: [Comment!] # Array of comments on the pin
    board: [String!]
  }

  type Query {
    pins: [Pin!]! # Fetch all Pin
    pinsByUser(id: ID!): [Pin!]
    pin(id: ID!): Pin # Get Pin by ID
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
  type Mutation {
    createPin(input: CreatePinInput!): CreatePinResponse!
    deletePin(input: ID!): DeletePinResponse!
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
`;

export default pinTypeDefs;
