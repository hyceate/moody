import mongoose, { Schema, Types } from 'mongoose';
import slugify from 'slugify';

interface Board {
  title: string;
  description?: string;
  user: Types.ObjectId;
  url: string;
  followers: Types.ObjectId[];
  pins: Types.ObjectId[];
  pinCount: number;
  isPrivate: boolean;
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
    url: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    pins: {
      type: [
        {
          type: Types.ObjectId,
          ref: 'Pin',
        },
      ],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);
boardSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.url = slugify(this.title, { lower: true });
  }
  next();
});
boardSchema.virtual('pinCount').get(function (this: { pins: any[] }): number {
  return this.pins.length;
});
boardSchema.index({ user: 1 });
boardSchema.index({ title: 1 });

export const Board = mongoose.model('board', boardSchema);
