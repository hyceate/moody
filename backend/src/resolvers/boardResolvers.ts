import { ObjectId } from 'mongoose';
import { Board } from '../models/board.model';
import { Pin } from '../models/pin.model';
import { User } from '../models/user.model';
import slugify from 'slugify';

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
  isPrivate: boolean;
  tags: string[];
  link: string;
  comments: { user: User; comment: string; commentTime: Date }[];
}
interface Board {
  _id: ObjectId;
  user: User;
  title: string;
  description: string;
  isPrivate: boolean;
  pins: Pin[];
  pinCount: number;
}
interface BoardInput {
  id: string;
  title: string;
  user: string;
  description: string;
  isPrivate: boolean;
}

export const boardResolvers = {
  Query: {
    boardsByUser: async (_: any, { userId }: { userId: ObjectId }) => {
      try {
        const boards = await Board.find({ user: userId })
          .populate({
            path: 'pins',
            model: Pin,
            populate: [{ path: 'user', model: User }],
            options: { sort: { createdAt: -1 } },
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
            populate: [{ path: 'user', model: User }],
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
          .sort({ createdAt: -1 })
          .populate({
            path: 'pins',
            model: Pin,
            perDocumentLimit: 3,
            populate: [{ path: 'user', model: User }],
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
      { username, url }: { username: string; url?: string },
    ) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error(`User with username '${username}' not found`);
        }
        const boards = await Board.find({ url })
          .populate({
            path: 'pins',
            model: Pin,
            populate: [{ path: 'user', model: User }],
            options: { sort: { createdAt: -1 } },
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
            populate: [{ path: 'user', model: User }],
          })
          .populate({ path: 'user', model: User });
        return boards;
      } catch (error) {
        console.error('Error fetching boards:', error);
        throw new Error('Failed to fetch boards');
      }
    },
    pinsByUserBoards: async (_: any, { userId }: { userId: string }) => {
      try {
        const boards = await Board.find({ user: userId }).populate({
          path: 'pins',
          model: Pin,
          populate: {
            path: 'user',
            model: User,
          },
          options: { sort: { createdAt: -1 } },
        });
        const pins = boards.flatMap((board) => board.pins);
        return pins;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    createBoard: async (_: any, { input }: { input: BoardInput }) => {
      try {
        const { title, user, description, isPrivate } = input;
        const existingBoard = await Board.findOne({ title, user: user });
        if (existingBoard) {
          return {
            success: false,
            message: 'Board already exists',
            board: null,
          };
        }
        const url = slugify(title, { lower: true });
        const newBoard = await Board.create({
          title,
          description,
          url,
          user,
          isPrivate,
        });
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
    updateBoard: async (_: any, { input }: { input: BoardInput }) => {
      const { id, title, user, isPrivate, description } = input;
      const existingBoard = Board.findById({ id: id });
    },
    // to do
    deleteBoard: async (_: any, { id }: { id: string }) => {
      const deletedBoard = await Board.findByIdAndDelete(id);
      return deletedBoard;
    },
  },
};
