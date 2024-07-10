import { Comment } from '../models/db/comment.model';
import { Pin } from '../models/db/pin.model';
import { User } from '../models/db/user.model';

type CommentInput = {
  user: string;
  pinId: string;
  comment: string;
};
export const commentResolvers = {
  Query: {
    getAllComments: async (_: any, { pinId }: { pinId: string }) => {
      try {
        const pin = await Pin.findById(pinId);
        if (!pin) {
          return { success: false, message: 'Unable to find pin' };
        }
        const allComments = await Comment.find({ pin: pinId })
          .populate({
            path: 'user',
            model: User,
            select: 'id username avatarUrl',
          })
          .sort({ createdAt: -1 })
          .select('comment createdAt ');

        return allComments;
      } catch (error) {
        return { success: false, message: 'Unable to get comments' };
      }
    },
  },
  Mutation: {
    addComment: async (
      _: any,
      { input }: { input: CommentInput },
      context: any,
    ) => {
      const currentUser = context.req.session.user
        ? context.req.session.user.id
        : null;
      const { pinId, user, comment } = input;

      try {
        if (!currentUser) {
          return { success: false, message: `you aren't logged in!` };
        }
        if (currentUser !== user) {
          return { success: false, message: `incorrect session` };
        }
        const commentCreator = await User.findById(user);
        if (!commentCreator) {
          return { success: false, message: `User not found` };
        }
        if (!comment.trim()) {
          return { success: false, message: `cannot have empty comment` };
        }

        const pin = await Pin.findById(pinId).populate({
          path: 'user',
          model: User,
        });
        if (!pin) {
          return { success: false, message: `cannot find pin!` };
        }

        const newComment = await Comment.create({
          user: commentCreator._id,
          comment,
          pin: pin._id,
        });

        if (!newComment) {
          return { success: false, message: 'Failed to create new comment' };
        }

        await Pin.findByIdAndUpdate(
          pinId,
          { $push: { comments: newComment._id } },
          { new: true, useFindAndModify: false },
        );
        const populatedComment = await newComment.populate('user');
        return { success: true, message: 'added comment' };
      } catch (error) {
        return { success: false, message: error };
      }
    },
  },
};
