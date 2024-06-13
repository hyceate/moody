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
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

boardSchema.virtual('pinCount').get(function (this: { pins: any[] }): number {
  return this.pins.length;
});
boardSchema.index({ user: 1 });
boardSchema.index({ title: 1 });
export const Board = mongoose.model('board', boardSchema);
