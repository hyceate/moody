export const fetchPinsSchema = `
  query GetPins {
    pins {
      id
      title
      imgPath
      imgWidth
      imgHeight
      user {
        username
        avatarUrl
      }
    }
  }
`;
export const fetchPinData = `
query getPin($id: ID!) {
  pin(id: $id) {
    user {
      id
      username
      avatarUrl
    }
    id
    title
    description
    link
    imgPath
    imgWidth
    imgHeight
    comments{
      user{
        id
        username
      }
      comment
      commentTime
    }
  }
}
`;
export const fetchUserData = `
  query getUserbyName($name: String!) {
    userByName(username: $name) {
      id
      username
      avatarUrl
    }
  }`;
export const createBoardGql = `
  mutation createBoard($input: CreateBoardInput!){
    createBoard(input: $input){
      success
      message
      board {
        title
      }
    }}
  `;
export const fetchUserBoards = `
  query GetBoardsByUser($user_Id: ID!) {
    boardsByUser(userId: $user_Id) {
      id
      title
      isPrivate
      url
      user{
        id
        username
      }
      pins {
        id
        title
        description
        imgPath
        imgWidth
        imgHeight
      }
      pinCount
    }
  }`;

export const fetchUserPins = `
  query getPinsByUser($id: ID!) {
    pinsByUser(id: $id) {
      id
      imgPath
      imgWidth
      imgHeight
    }
  }`;

// singular board with pins
export const fetchBoardsByUsernameTitle = `
  query boards($username: String!, $url: String!){
    boardsByUsernameTitle(username: $username, url: $url){
      id
      title
      isPrivate
      url
      description
      pins {
        id
        title
        description
        imgPath
        imgWidth
        imgHeight
      }
      pinCount
    }
  }
`;
export const fetchPinsByUserBoards = `
query PinsByUserBoards($userId: ID!){
  pinsByUserBoards(userId: $userId){
    id
    imgPath
    imgWidth
    imgHeight
    createdAt
    user{
      id
      username
    }
  }}`;

export const createPinMutationSchema = `
mutation CreatePin($input: CreatePinInput!) {
  createPin(input: $input) {
    success
    message
    pin {
      id
      title
      description
      imgPath
      imgWidth
      imgHeight
      tags
      link
    }
  }
}
`;
export const fetchBoardsForForm = `
query GetBoardsByUser($userId: ID!) {
boardsByUser(userId: $userId) {
  id
  title
}
}
`;
