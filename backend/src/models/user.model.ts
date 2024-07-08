import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface User {
  role: string;
  username: string;
  email: string;
  password: string;
  avatarUrl: string | '';
  followers: Schema.Types.ObjectId[];
  following: Schema.Types.ObjectId[];
  comparePassword(password: string): Promise<boolean>;
  updateAvatar(filename: string, path: string): Promise<void>;
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
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { collection: 'users', timestamps: true },
);

userSchema.pre('save', async function (next) {
  // this refers to user object being saved
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
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
userSchema.methods.updateAvatar = async function (
  filename: string,
  path: string,
): Promise<void> {
  this.avatarUrl = `/images/${this._id}/${filename}`;
  await this.save();
};
export const User = mongoose.model<User>('user', userSchema);
