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
    createdAt: String
    user: User # Reference to the owner of the pin
    tags: [String!] # Array of tags
    private: Boolean
    link: String
    comments: [Comment!] # Array of comments on the pin
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
  type Mutation {
    createPin(input: CreatePinInput!): CreatePinResponse!
    deletePin(id: ID!): DeletePinResponse!
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
