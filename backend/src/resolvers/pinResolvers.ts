import { Pin, PinType } from '../models/db/pin.model';
import { User } from '../models/db/user.model';
import { Board } from '../models/db/board.model';
import { Comment } from '../models/db/comment.model';
import { deletePinById } from './shared';
import path from 'path';
import fs from 'fs';
// import { inspect } from 'util';
interface User {
  id?: Uint8Array;
  username?: string;
  email?: string;
}

interface PinInput {
  id?: string;
  user: User;
  title: string;
  description: string;
  link: string;
  tags: string[];
  imgPath: string;
  board?: string;
  currentBoard?: string;
  newBoard?: string;
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
      const currentUser = context.req.session.user
        ? context.req.session.user.id
        : null;
      try {
        const pinsByUser = await Pin.find({
          user: userid,
          $or: [{ isPrivate: false }, { isPrivate: true, user: currentUser }],
        })
          .populate('user', ['username', 'avatarUrl'])
          .select({ comments: 0, tags: 0, description: 0, updatedAt: 0 })
          .sort({ createdAt: -1 });

        return pinsByUser;
      } catch (error) {
        console.error('Error fetching pins by user:', error);
        throw new Error('Failed to fetch pins by user');
      }
    },
    pin: async (_: any, { id }: { id: string }, context: any) => {
      const currentUser = context.req.session.user
        ? context.req.session.user.id
        : null;
      try {
        const pin = await Pin.findById(id)
          .populate('user comments.user')
          .populate({
            path: 'boards',
            populate: [
              {
                path: 'board',
                model: Board,
                select: 'user id title description url isPrivate pins',
                populate: { path: 'user', model: User, select: 'id username' },
              },
            ],
          })
          .sort({ 'boards.savedAt': -1 });
        if (!pin) {
          throw new Error('Pin not found');
        }
        const boardsByCurrentUser = pin.boards || [];

        // Filter boards to find those owned by the current user
        const boardsOwnedByUser = boardsByCurrentUser.filter(
          (boardRef: any) => {
            return (
              boardRef.board &&
              boardRef.board.user &&
              boardRef.board.user.id === currentUser
            );
          },
        );
        // Find the latest savedAt for boards owned by the current user
        let latestBoard = null;
        if (boardsOwnedByUser.length > 0) {
          latestBoard = boardsOwnedByUser.reduce((prev: any, current: any) => {
            return prev.savedAt > current.savedAt ? prev : current;
          });
        }
        pin.boards = latestBoard ? [latestBoard] : [];
        // console.log(inspect(pin, { depth: null }));
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
        // console.log('Create Pin Input: ', input);
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
          newPin.boards = [{ board: boardId, savedAt: new Date() }];
        }

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
    updatePin: async (_: any, { input }: { input: PinInput }, context: any) => {
      const currentUser = context.req.session.user
        ? context.req.session.user.id
        : null;
      const {
        user,
        id: pinId,
        title,
        description,
        link,
        currentBoard,
        newBoard,
      } = input;
      if (!currentUser || currentUser !== user) {
        return { success: false, message: 'You are not authorized' };
      }
      try {
        const pinUpdate = await Pin.findById(pinId);
        if (!pinUpdate) {
          return { success: false, message: 'Unable to find pin' };
        }

        pinUpdate.title = title;
        pinUpdate.description = description;
        pinUpdate.link = link;

        const updateBoards = async (
          currentBoardId: string,
          newBoardId: string,
          pin: PinType,
        ) => {
          let oldBoard, newBoardData;

          if (currentBoardId) {
            oldBoard = await Board.findById(currentBoardId).lean();
            if (!oldBoard) {
              return { success: false, message: 'Old board not found' };
            }
          }

          if (newBoardId) {
            newBoardData = await Board.findById(newBoardId).lean();
            if (!newBoardData) {
              return { success: false, message: 'New board not found' };
            }
          }

          // Remove from current board if a board is selected
          if (oldBoard) {
            await Board.findByIdAndUpdate(currentBoardId, {
              $pull: { pins: pin._id },
            });
          }

          if (newBoardData) {
            // Add to the new board
            await Board.findByIdAndUpdate(newBoardId, {
              $push: { pins: pin._id },
            });
            pin.boards = [
              ...pin.boards!.filter(
                (b) => b.board._id.toString() !== currentBoardId,
              ),
              { board: newBoardData._id, savedAt: new Date() },
            ];
            // Update pin's privacy settings based on the new board
            if (oldBoard?.isPrivate && !newBoardData.isPrivate) {
              pin.isPrivate = false;
            } else if (oldBoard?.isPrivate && newBoardData.isPrivate) {
              pin.isPrivate = true;
            }
          } else {
            return { success: false, message: 'Unable to add to new board' };
          }
        };

        await updateBoards(currentBoard!, newBoard!, pinUpdate);
        await pinUpdate.save();

        return {
          success: true,
          message: 'Pin updated successfully',
          pin: pinUpdate,
        };
      } catch (error) {
        return error;
      }
    },

    savePinToBoard: async (
      _: any,
      { pinId, boardId }: { pinId: string; boardId: string },
      context: any,
    ) => {
      const currentUser = context.req.session.user
        ? context.req.session.user.id
        : null;
      try {
        if (!currentUser) {
          return { success: false, message: 'You are not logged in.' };
        }
        const pin = await Pin.findById(pinId);
        const board = await Board.findById(boardId);
        if (!pin || !board) {
          return {
            success: false,
            message: 'Pin or Board not found',
          };
        }
        if (board.user.toString() !== currentUser) {
          return {
            success: false,
            message: 'You are not authorized to edit board',
          };
        }
        if (board.pins.includes(pin._id)) {
          return { success: false, message: 'Already saved in board' };
        }
        await Board.findByIdAndUpdate(boardId, {
          $push: { pins: pin._id },
        });
        pin.boards = [
          ...pin.boards!.filter((b) => b.board.toString() !== boardId),
          { board: board._id, savedAt: new Date() },
        ];
        await pin.save();
        return {
          success: true,
          message: 'Pin saved to board successfully',
        };
      } catch (error) {
        return {
          success: false,
          message: error,
        };
      }
    },

    deletePin: async (_: any, { id }: { id: string }) => {
      return deletePinById(id);
    },

    deletePinFromBoard: async (
      _: any,
      { pinId, boardId }: { pinId: string; boardId: string },
      context: any,
    ) => {
      const currentUser = context.req.session.user
        ? context.req.session.user.id
        : null;
      if (!currentUser) {
        return { success: false, message: 'You are not logged in.' };
      }
      try {
        const pin = await Pin.findById(pinId);
        const board = await Board.findById(boardId);
        if (!board || !pin)
          return { success: false, message: 'Board not found' };
        if (
          board.user.toString() !== currentUser ||
          pin.user.toString() !== currentUser
        ) {
          return {
            success: false,
            message: 'You are not authorized to edit board or pin',
          };
        }
        pin.boards = pin.boards!.filter((b) => b.board.toString() !== boardId);
        await pin.save();
        await Board.findByIdAndUpdate(
          boardId,
          { $pull: { pins: pin._id } },
          { new: true, useFindAndModify: false },
        );
        return { success: true, message: 'Pin removed from board' };
      } catch (error) {
        return { success: false, message: error };
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
      await Pin.findByIdAndUpdate(
        pinId,
        { $push: { comments: newComment._id } },
        { new: true, useFindAndModify: false },
      );
      return {
        success: true,
        message: 'Comment saved',
      };
    },
  },
};
