export const fetchPinsSchema = `
  query GetPins {
    pins {
      id
      title
      imgPath
      imgWidth
      imgHeight
      isPrivate
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
    boards {
      savedAt
      board {
        id
        title
        user {
          id
          username
        }
      }
    }
    id
    title
    description
    isPrivate
    link
    imgPath
    imgWidth
    imgHeight
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

export const fetchUserPins = `
  query getPinsByUser($userid: ID!) {
    pinsByUser(userid: $userid) {
      id
      user {
        username
        avatarUrl
      }
      isPrivate
      imgPath
      imgWidth
      imgHeight
    }
  }`;

export const fetchPinsByUserBoards = `
query PinsByUserBoards($userId: ID!, $sort: Int = -1){
  pinsByUserBoards(userId: $userId, sort: $sort){
    id
    imgPath
    imgWidth
    imgHeight
    createdAt
    user{
      id
      username
      avatarUrl
    }
    boards {
      savedAt
      board {
        id
        title
        user {
          id
          username
        }
      }
    }
  }
}`;

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

export const fetchBoardsForForm = `
  query GetBoardsByUser($userId: ID!) {
    boardsByUser(userId: $userId) {
      id
      title
      isPrivate
      pins{
        imgPath
      }
    }
}
`;
// singular board with pins
export const fetchBoardsByUsernameTitle = `
  query boards($username: String!, $url: String!){
    boardsByUsernameTitle(username: $username, url: $url){
      id
      title
      isPrivate
      url
      description
      user{
        id
        username
        avatarUrl
      }
      pins {
        id
        title
        description
        imgPath
        imgWidth
        imgHeight
        user{
          username
          avatarUrl
        }
        boards {
          savedAt
          board {
            id
            title
            user {
              id
              username
            }
          }
        }
      }
      pinCount
    }
  }
`;

export const fetchComments = `
query getAllComments($pinId: ID!){
  getAllComments(pinId: $pinId) {
    id
    comment
    createdAt
    user {
      id
      username
      avatarUrl
    }
  }
}`;

// * Mutations
export const savePinToBoard = `
mutation SavePinToBoard($pinId: ID!, $boardId: ID!) {
    savePinToBoard(pinId: $pinId, boardId: $boardId) {
      success
      message
    }
  }`;
export const deletePinFromBoard = `
mutation DeletePinFromBoard($pinId: ID!, $boardId: ID!) {
    deletePinFromBoard(pinId: $pinId, boardId: $boardId) {
      success
      message
    }
}`;
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
export const updatePinMutation = `
mutation UpdatePin($input: UpdatePinInput!){
  updatePin(input: $input){
    success
    message
    pin {
      id
      title
      description
      link
      boards{
        board{
          title
        }
        savedAt
      }
    }
  }
}`;

export const createBoardGql = `
  mutation createBoard($input: CreateBoardInput!){
    createBoard(input: $input){
      success
      message
      board {
        title
        description
        isPrivate
      }
    }
  }`;

export const updateBoardGql = `
mutation updateBoard($input: CreateBoardInput!){
  updateBoard(input: $input){
    success
    message
    board {
      title
      description
      isPrivate
    }
  }
}`;
export const deleteBoardSchema = `
mutation($boardId: ID!){
  deleteBoard(boardId: $boardId){
    success
    message
  }
}`;

export const addCommentGql = `
mutation($input: CommentInput!){
  addComment(input: $input){
    success
    message
  }
}
`;
export const editCommentGql = `
mutation($input: CommentInput!){
  updateComment(input: $input){
    success
    message
  }
}
`;
export const removeCommentGql = `
mutation($input: DeleteCommentInput!){
  deleteComment(input: $input){
    success
    message
  }
}
`;
