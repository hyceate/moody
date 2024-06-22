import mongoose, { Schema, Types } from 'mongoose';
interface Pin {
  title: string;
  description?: string;
  imgPath: string;
  imgWidth: number;
  imgHeight: number;
  createdAt: Date;
  user: Types.ObjectId;
  tags?: string[];
  isPrivate: boolean;
  link?: string;
  comments: {
    user: Types.ObjectId;
    comment: string;
    commentTime: Date;
  }[];
}

const pinSchema: Schema<Pin> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      required: false,
      trim: true,
      minlength: 0,
      maxLength: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxLength: 500,
    },
    imgPath: {
      type: String,
      required: true,
      trim: true,
    },
    imgWidth: {
      type: Number,
      required: true,
      trim: true,
    },
    imgHeight: {
      type: Number,
      required: true,
      trim: true,
    },
    link: {
      trim: true,
      type: String,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'comment',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
pinSchema.index({ user: 1 });
pinSchema.index({ createdAt: -1 });
pinSchema.index({ tags: 1 });
export const Pin = mongoose.model('pin', pinSchema);
