import { Pin } from '../models/pin.model';
import { User } from '../models/user.model';
import { Board } from '../models/board.model';
import { Comment } from '../models/comment.model';
import { deletePinById } from './shared';
import path from 'path';
import fs from 'fs';

interface User {
  username: string;
  email: string;
}
interface Pin {
  title: string;
  description: string;
  imgPath: string;
  imgWidth: string;
  imgHeight: string;
  createdAt: Date;
  user: User;
  tags: string[];
  private: boolean;
  link: string;
  comments: Comment[];
}
interface PinInput {
  user: User;
  title: string;
  description: string;
  link: string;
  tags: string[];
  imgPath: string;
  board?: string;
}
export const pinResolvers = {
  Query: {
    // all pins
    pins: async (_: any, _args: any, context: any) => {
      try {
        const currentUser = context.req.session.user
          ? context.req.session.user.id
          : null;
        const pins = await Pin.find({
          $or: [{ isPrivate: false }, { isPrivate: true, user: currentUser }],
        })
          .sort({ createdAt: -1 })
          .populate('user');

        return pins;
      } catch (error) {
        throw new Error('Error fetching pins');
      }
    },
    // profile pins
    pinsByUser: async (
      _: any,
      { userid }: { userid: string },
      context: any,
    ) => {
      try {
        const currentUser = context.req.session.user
          ? context.req.session.user.id
          : null;
        const pinsByUser = await Pin.find({
          user: userid,
          $or: [{ isPrivate: false }, { isPrivate: true, user: currentUser }],
        }).populate('user', ['username', 'avatarUrl'])
          .select({ comments: 0, tags: 0, description: 0, updatedAt: 0 })
          .sort({ createdAt: -1 });

        return pinsByUser;
      } catch (error) {
        console.error('Error fetching pins by user:', error);
        throw new Error('Failed to fetch pins by user');
      }
    },
    pin: async (_: any, { id }: { id: string }) => {
      try {
        const pin = await Pin.findById(id).populate('user comments.user');
        if (!pin) {
          throw new Error('Pin not found');
        }
        return pin;
      } catch (error) {
        throw new Error('Error fetching pin');
      }
    },
  },
  Mutation: {
    createPin: async (_: any, { input }: { input: PinInput }) => {
      try {
        const user = await User.findById(input.user);
        console.log('Create Pin Input: ', input);
        if (!user) {
          throw new Error('User not found');
        }
        let boardId = null;
        let isPrivate = false;
        if (input.board) {
          const board = await Board.findById(input.board, {
            _id: 1,
            isPrivate: 1,
          });
          if (!board) {
            throw new Error('Board not found');
          }
          boardId = board._id;
          isPrivate = board.isPrivate;
        }
        const newPin = new Pin({
          ...input,
          isPrivate: isPrivate,
        });
        if (boardId) {
          newPin.board = [boardId];
        }
        console.log('New Pin: ', newPin);
        await newPin.save();
        if (boardId) {
          await Board.findByIdAndUpdate(
            boardId,
            { $push: { pins: newPin._id } },
            { new: true, useFindAndModify: false },
          );
        }
        const flattenedTags = input.tags.flat();
        const serializedPin = {
          ...newPin.toObject(),
          id: newPin._id.toString(),
          tags: flattenedTags || null,
        };
        return {
          success: true,
          message: 'Pin created successfully',
          pin: serializedPin,
        };
      } catch (error) {
        const imagePath = path.join(
          __dirname,
          `../../../frontend/public/${input.imgPath}`,
        );
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error(`Error deleting image ${input.imgPath}:`, error);
        }
        return {
          success: false,
          message: error,
          pin: null,
        };
      }
    },
    deletePin: async (_: any, { id }: { id: string }) => {
      return deletePinById(id);
    },
    savePinToBoard: async (
      _: any,
      { pinId, boardId }: { pinId: string; boardId: string },
      context: any,
    ) => {
      try {
        if (!context.user) {
          return;
        }
        const pin = await Pin.findById(pinId);
        const board = await Board.findById(boardId);
        if (!pin || !board) {
          return {
            success: false,
            message: 'Pin or Board not found',
          };
        }
        if (board.user.toString() !== context.user.id) {
          return {
            success: false,
            message: 'You are not authorized to edit board',
          };
        }
        if (!board.pins.includes(pin._id)) {
          board.pins.push(pin._id);
          await board.save;
        }
        return {
          success: true,
          message: 'Pin saved to board successfully',
          board,
        };
      } catch (error) {
        return {
          success: false,
          message: error,
          board: null,
        };
      }
    },
    createComment: async (
      _: any,
      {
        userId,
        pinId,
        commentText,
      }: { userId: string; pinId: string; commentText: string },
    ) => {
      const newComment = new Comment({
        user: userId,
        comment: commentText,
        commentTime: new Date(),
      });
      await newComment.save();
      await Pin.findByIdAndUpdate(pinId, {
        $push: { comments: newComment._id },
      });
      return {
        success: true,
        message: 'Comment saved',
      };
    },
  },
};
