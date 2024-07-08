import mongoose, { Schema, Types } from 'mongoose';

interface Comment {
  user: Types.ObjectId;
  comment: string;
  commentTime: Date;
}

const commentSchema: Schema<Comment> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    commentTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model('comment', commentSchema);
