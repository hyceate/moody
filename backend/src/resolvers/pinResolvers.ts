import { ObjectId, SortOrder } from 'mongoose';
import { Pin } from '../models/pin.model';
import { User } from '../models/user.model';
import { Board } from '../models/board.model';
import fs from 'fs';
import path from 'path';

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
    pins: async (
      _: any,
      { sort }: { sort?: { field: keyof Pin; direction: 'ASC' | 'DESC' } },
    ) => {
      try {
        const sortOptions: { [key: string]: SortOrder } = {};
        if (sort) {
          const { field, direction } = sort;
          sortOptions[field] = direction === 'ASC' ? 1 : -1;
        } else {
          sortOptions.createdAt = -1;
        }
        const pins = await Pin.find()
          .populate('user comments.user')
          .sort(sortOptions);

        return pins;
      } catch (error) {
        throw new Error('Error fetching pins');
      }
    },
    pinsByUser: async (
      _: any,
      { id }: { id: string },
      { sort }: { sort?: { field: keyof Pin; direction: 'ASC' | 'DESC' } },
    ) => {
      try {
        const sortOptions: { [key: string]: SortOrder } = {};
        if (sort) {
          const { field, direction } = sort;
          sortOptions[field] = direction === 'ASC' ? 1 : -1;
        } else {
          sortOptions.createdAt = -1;
        }
        const pinsByUser = await Pin.find({ user: id })
          .populate('user comments.user')
          .sort(sortOptions);
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
        const pin = await Pin.findById(id);
        if (!pin) {
          throw new Error('Pin not found');
        }
        await Pin.findByIdAndDelete(id);
        const imagePath = path.join(
          __dirname,
          `../../../frontend/public/${pin.imgPath}`,
        );
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error(`Error deleting image ${imagePath}:`, err);
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
