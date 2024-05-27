import mongoose, { Schema, Types } from 'mongoose';
import { Board } from './board.model';
import bcrypt from 'bcryptjs';

interface User {
  role: string;
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema: Schema<User> = new Schema(
  {
    role: {
      type: String,
      default: 'user',
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
  },
  { collection: 'users', timestamps: true },
);

userSchema.pre('save', async function (next) {
  // this refers to user object being saved
  if (!this.isModified('password')) return next(); // skip hashing if password is not modified
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    if (this.isNew) {
      // Create a new board for the user
      const board = new Board({
        user: this._id,
        title: 'Default',
        description: 'This is your default board',
        followers: [],
        pins: [],
      });
      await board.save();
    }
    next();
  } catch (error) {
    return next();
  }
});

userSchema.methods.comparePassword = async function (
  loginPass: string,
): Promise<boolean> {
  const isMatch = await bcrypt.compare(loginPass, this.password);
  return isMatch;
};

export const User = mongoose.model<User>('user', userSchema);
