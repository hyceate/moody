import { ObjectId } from 'mongoose';
import { Board } from '../models/board.model';
import { Pin } from '../models/pin.model';
import { User } from '../models/user.model';
import slugify from 'slugify';
import { deletePinById } from './shared';

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
    boardsByUser: async (
      _: any,
      { userId }: { userId: ObjectId },
      context: any,
    ) => {
      try {
        const currentUser = context.req.session.user
          ? context.req.session.user.id
          : null;

        const boards = await Board.find({
          user: userId,
          $or: [{ isPrivate: false }, { isPrivate: true, user: currentUser }],
        })
          .sort({ title: 1 })
          .populate({
            path: 'pins',
            model: Pin,
            populate: [{ path: 'user', model: User }],
            options: { sort: { createdAt: -1 } },
            perDocumentLimit: 3,
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
            options: { sort: { createdAt: -1 } },
            populate: [{ path: 'user', model: User }],
          })
          .populate({ path: 'user', model: User });

        return boards;
      } catch (error) {
        console.error('Error fetching boards:', error);
        throw new Error('Failed to fetch boards');
      }
    },
    pinsByUserBoards: async (
      _: any,
      { userId }: { userId: string },
      context: any,
    ) => {
      try {
        const currentUser = context.req.session.user
          ? context.req.session.user.id
          : null;
        const boards = await Board.find({
          user: userId,
          $or: [{ isPrivate: false }, { isPrivate: true, user: currentUser }],
        }).populate({
          path: 'pins',
          model: Pin,
          options: { sort: { createdAt: -1 } },
          populate: {
            path: 'user',
            model: User,
          },
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
    // to do
    updateBoard: async (_: any, { input }: { input: BoardInput }) => {
      const { id, title, user, isPrivate, description } = input;
      try {
        const board = await Board.findById({ id: id }).populate({
          path: 'pins',
          model: Pin,
        });
        if (!board)
          return {
            success: false,
            message: 'unable to find board',
            board: null,
          };
        if (board.user.toString() !== user)
          return {
            success: false,
            message: 'not authorized to edit board',
            board: null,
          };
        board.title = title;
        board.isPrivate = isPrivate;
        board.description = description;
        await board.save();
        const boardPins = board.pins.flatMap((pin: any) => pin._id);
        await Pin.updateMany(
          { _id: { $in: boardPins } },
          { $set: { isPrivate: isPrivate } },
        );
      } catch (error) {
        return error;
      }
    },
    // to test
    deleteBoard: async (
      _: any,
      { boardId }: { boardId: string },
      context: any,
    ) => {
      const currentUser = context.req.session.user
          ? context.req.session.user.id
          : null;
      try {
        const boardToDelete = await Board.findById(boardId)
          .select('id user title isPrivate')
          .populate({
            path: 'pins',
            model: Pin,
            select: 'id isPrivate',
            populate: {
              path: 'user',
              model: User,
            },
          });

        if (!boardToDelete) {
          return { success: false, message: 'Board Not Found' };
        }
        if (boardToDelete.user.toString() !== currentUser) {
          return { success: false, message: 'Not authorized to delete board' };
        }
        const boardPins = boardToDelete.pins.flatMap((pin: any) => pin._id);
        for (const pinId of boardPins) {
          const pin = await Pin.findById(pinId)
            .select('isPrivate user imgPath boardRefs')
            .populate('user', 'id');
    
          if (pin?.user.id.toString() === currentUser) {
            const updatedPin = await Pin.findByIdAndUpdate(
              pinId,
              { $pull: { board: boardId } },
              { new: true }
            );
            if (updatedPin && updatedPin.board) {
              if (boardToDelete.isPrivate) {
                if (updatedPin.board.length === 0) {
                  await deletePinById(pinId);
                }
              } else {
                if (updatedPin.board.length === 0 && updatedPin.isPrivate) {
                  await deletePinById(pinId);
                }
              }
            }
          }
        }
    
        await Board.findByIdAndDelete(boardId);
        return {
          success: true,
          message: 'Successfully deleted board',
        };
      } catch (error) {
        return error;
      }
    },
  },
};
