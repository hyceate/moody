import { Pin } from './pin.model';
import { User } from './user.model';
import mongoose, { Schema, Types } from 'mongoose';

interface Board {
  title: string;
  description?: string;
  user: Types.ObjectId;
  followers: Types.ObjectId[];
  pins: Types.ObjectId[];
  pinCount: number;
  private: boolean;
}
const boardSchema: Schema<Board> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false,
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    private: {
      type: Boolean,
      default: false,
    },
    pins: {
      type: [
        {
          type: Types.ObjectId,
          ref: 'Pin',
        },
      ], // array of pins
    },
  },
  { timestamps: true, toObject: { virtuals: true } },
);
// Define the virtual field `pinCount`
boardSchema.virtual('pinCount').get(function (this: { pins: any[] }): number {
  return this.pins.length;
});

// Ensure virtual fields are included when converting to JSON
boardSchema.set('toJSON', {
  virtuals: true,
});

// Ensure virtual fields are included when converting to Object
boardSchema.set('toObject', {
  virtuals: true,
});
export const Board = mongoose.model('board', boardSchema);
