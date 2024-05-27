import { ObjectId } from 'mongoose';
import { Board } from '../models/board.model';
import { Pin } from '../models/pin.model';
import { User } from '../models/user.model';

interface User {
  _id: ObjectId;
  username: string;
  email: string;
}
interface Pin {
  _id: ObjectId;
  title: string;
  description: string;
  imgPath: string;
  createdAt: Date;
  user: User;
  savedBy: User[];
  tags: string[];
  private: boolean;
  link: string;
  comments: { user: User; comment: string; commentTime: Date }[];
}
interface Board {
  _id: ObjectId;
  user: User;
  title: string;
  description: string;
  private: boolean;
  pins: Pin[];
  pinCount: number;
}
interface BoardInput {
  name: string;
  title: string;
  description: string;
  private: boolean;
}

export const boardResolvers = {
  Query: {
    boardsByUser: async (_: any, { userId }: { userId: ObjectId }) => {
      try {
        const boards = await Board.find({ user: userId })
          .populate({
            path: 'pins',
            model: Pin,
            populate: [
              { path: 'user', model: User },
              { path: 'savedBy', model: User },
            ],
          })
          .populate({ path: 'user', model: User });
        return boards;
      } catch (error) {
        console.error('Error fetching boards:', error);
        throw new Error('Failed to fetch boards');
      }
    },
    // Fetch a board by its ID
    board: async (_: any, { id }: { id: ObjectId }) => {
      try {
        const board = await Board.findById(id)
          .populate({ path: 'user', model: User })
          .populate({
            path: 'pins',
            model: Pin,
            populate: [
              { path: 'user', model: User },
              { path: 'savedBy', model: User },
            ],
          });

        return board;
      } catch (error) {
        console.error('Failed to fetch board:', error);
        throw new Error('Failed to fetch board');
      }
    },
    boardsByUserName: async (_: any, { username }: { username: string }) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error(`User with username '${username}' not found`);
        }
        const boards = await Board.find({ user: user._id })
          .populate({
            path: 'pins',
            model: Pin,
            populate: [
              { path: 'user', model: User },
              { path: 'savedBy', model: User },
            ],
          })
          .populate({ path: 'user', model: User });
        return boards;
      } catch (error) {
        console.error('Error fetching boards:', error);
        throw new Error('Failed to fetch boards');
      }
    },
    boardsByUsernameTitle: async (
      _: any,
      { username, title }: { username: string; title?: string },
    ) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error(`User with username '${username}' not found`);
        }
        const filter: any = { user: user._id };
        if (title) {
          filter.title = { $regex: title, $options: 'i' };
        }
        const boards = await Board.find(filter)
          .populate({
            path: 'pins',
            model: Pin,
            populate: [
              { path: 'user', model: User },
              { path: 'savedBy', model: User },
            ],
          })
          .populate({ path: 'user', model: User });

        return boards;
      } catch (error) {
        console.error('Error fetching boards:', error);
        throw new Error('Failed to fetch boards');
      }
    },
    allBoards: async () => {
      try {
        const boards = await Board.find()
          .populate({
            path: 'pins',
            model: Pin,
            populate: [
              { path: 'user', model: User },
              { path: 'savedBy', model: User },
            ],
          })
          .populate({ path: 'user', model: User });
        return boards;
      } catch (error) {
        console.error('Error fetching boards:', error);
        throw new Error('Failed to fetch boards');
      }
    },
  },
  Mutation: {
    createBoard: async (_: any, { input }: { input: BoardInput }) => {
      try {
        // Create the board with a reference to the user's ObjectId
        const newBoard = await Board.create(input);
        // Populate the 'user' field to include the user's data
        const populatedBoard = await newBoard.populate('user');

        return {
          success: true,
          message: 'Board created successfully',
          board: populatedBoard,
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            success: false,
            message: error.message,
            board: null,
          };
        } else {
          return {
            success: false,
            message: 'An unknown error occurred',
            board: null,
          };
        }
      }
    },

    // Delete a board by its ID
    deleteBoard: async (_: any, { id }: { id: string }) => {
      const deletedBoard = await Board.findByIdAndDelete(id);
      return deletedBoard;
    },
  },
};
