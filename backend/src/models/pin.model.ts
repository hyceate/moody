import mongoose, { Schema, Types } from 'mongoose';
interface Pin {
  title: string;
  description?: string;
  imgPath: string;
  createdAt: Date;
  user: Types.ObjectId;
  tags?: string[];
  private: boolean;
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
    link: {
      trim: true,
      type: String,
    },
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'user',
          required: true,
          trim: true,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        commentTime: {
          type: Date,
          required: true,
          trim: true,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    private: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Pin = mongoose.model('pin', pinSchema);
