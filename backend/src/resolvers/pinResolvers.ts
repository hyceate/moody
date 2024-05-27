import { ObjectId } from 'mongoose';
import { Pin } from '../models/pin.model';
import { User } from '../models/user.model';
import { Board } from '../models/board.model';
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
interface PinInput {
  user: User;
  title: string;
  description: string;
  link: string;
  tags: string[];
  imgPath: string;
  board: string;
}
export const pinResolvers = {
  Query: {
    pins: async () => {
      try {
        const pins = await Pin.find().populate('user savedBy comments.user');
        return pins;
      } catch (error) {
        throw new Error('Error fetching pins');
      }
    },
    pinsByUser: async (_: any, { id }: { id: string }) => {
      try {
        const pinsByUser = await Pin.find({ user: id }).populate(
          'user savedBy comments.user',
        );
        return pinsByUser;
      } catch (error) {
        console.error('Error fetching pins by user:', error);
        throw new Error('Failed to fetch pins by user');
      }
    },
    pin: async (_: any, { id }: { id: string }) => {
      try {
        const pin = await Pin.findById(id).populate(
          'user savedBy comments.user',
        );
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
        console.log(input);
        if (!user) {
          throw new Error('User not found');
        }
        const newPin = new Pin({
          ...input,
          createdAt: new Date().toISOString(),
        });
        await newPin.save();
        await Board.findByIdAndUpdate(
          input.board,
          { $push: { pins: newPin._id } },
          { new: true, useFindAndModify: false },
        );
        const flattenedTags = input.tags.flat();
        // Include _id when serializing the pin object
        const serializedPin = {
          ...newPin.toObject(),
          id: newPin._id.toString(), // Convert _id to string for serialization
          tags: flattenedTags || null,
        };

        return {
          success: true,
          message: 'Pin created successfully',
          pin: serializedPin,
        };
      } catch (error) {
        return {
          success: false,
          // @ts-expect-error
          message: error.message,
          pin: null,
        };
      }
    },
    deletePin: async (_: any, { id }: { id: string }) => {
      try {
        const pin = await Pin.findByIdAndDelete(id);
        if (!pin) {
          throw new Error('Pin not found');
        }
        return {
          success: true,
          message: 'Pin deleted successfully',
        };
      } catch (error) {
        return {
          success: false,
          message: (error as Error).message,
        };
      }
    },
  },
};
