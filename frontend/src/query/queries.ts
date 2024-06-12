export const fetchPinsSchema = `
  query GetPins {
    pins {
      id
      title
      description
      imgPath
      user {
        username
        id
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
  }
}
`;
export const fetchUserData = `
  query getUserbyName($name: String!) {
    userByName(username: $name) {
      id
      username
    }
  }`;

export const fetchUserBoards = `
  query GetBoardsByUser($user_Id: ID!) {
    boardsByUser(userId: $user_Id) {
      id
      title
      private
      pins {
        id
        title
        description
        imgPath
      }
      pinCount
    }
  }`;

export const fetchUserPins = `
  query getPinsByUser($id: ID!) {
    pinsByUser(id: $id) {
      id
      title
      description
      link
      imgPath
    }
  }`;

// singular board with pins
export const fetchBoardsByUsernameTitle = `
  query boards($username: String!, $title: String!){
    boardsByUsernameTitle(username: $username, title: $title){
      title
      private
      pins {
        id
        title
        description
        imgPath
      }
      pinCount
    }
  }
`;

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
