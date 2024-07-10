import mongoose, { Schema, Types } from 'mongoose';

export interface CommentType {
  user: Types.ObjectId;
  comment: string;
  pin: Types.ObjectId;
}

const commentSchema: Schema<CommentType> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    pin: {
      type: Schema.Types.ObjectId,
      ref: 'pin',
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model('comment', commentSchema);
