import { User } from '../models/db/user.model';
import { Board } from '../models/db/board.model';
import { Pin } from '../models/db/pin.model';
import bcrypt from 'bcryptjs';
import { validateEmail, validateLength } from '../functions/validate';

interface SignUpInput {
  username: string;
  email: string;
  password: string;
}
interface UpdateInput {
  id: string;
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface CustomSessionData {
  user?: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
  };
}
export const userResolvers = {
  Query: {
    users: async (_: any) => {
      try {
        return await User.find();
      } catch (error) {
        throw new Error('Error fetching users');
      }
    },
    user: async (_: any, { id }: { id: string }) => {
      try {
        return await User.findById(id);
      } catch (error) {
        throw new Error('Error fetching user');
      }
    },
    userByName: async (_: any, { username }: { username: string }) => {
      try {
        return await User.findOne({ username: username });
      } catch (error) {
        throw new Error('Error fetching user');
      }
    },
  },
  Mutation: {
    signUp: async (_: any, { input }: { input: SignUpInput }) => {
      try {
        const { username, email, password } = input;
        if (!validateLength(username)) {
          throw new Error('Invalid username.');
        }
        if (!validateEmail(email) || !validateLength(password)) {
          throw new Error('Invalid email or password.');
        }

        const existingUserByUsername = await User.findOne({ username });
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByUsername && existingUserByEmail) {
          return {
            success: false,
            message: 'Account already exists under this username or email.',
            errorType: 'both',
          };
        } else if (existingUserByUsername) {
          return {
            success: false,
            message: 'Account already exists under this username.',
            errorType: 'username',
          };
        } else if (existingUserByEmail) {
          return {
            success: false,
            message: 'Account already exists under this email.',
            errorType: 'email',
          };
        }
        // Create new user
        const newUser = await User.create({
          role: 'user',
          username,
          email,
          password,
        });
        return { success: true, user: newUser, message: 'User Created' };
      } catch (error) {
        return {
          success: false,
          message: 'Signup failed: An unknown error occurred.',
        };
      }
    },
    updateAccount: async (
      _: any,
      { input }: { input: UpdateInput },
      context: any,
    ) => {
      try {
        const {
          id,
          username,
          email,
          currentPassword,
          newPassword,
          confirmPassword,
        } = input;

        const user = await User.findById(id);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errorType: 'incorrectUser',
          };
        }
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Password Incorrect',
            errorType: 'incorrectPassword',
          };
        }
        user.username =
          username && username !== user.username ? username : user.username;
        user.email = email && email !== user.email ? email : user.email;

        if (newPassword && confirmPassword) {
          if (newPassword !== confirmPassword) {
            return {
              success: false,
              message: 'Passwords do not match.',
              errorType: 'matchPassword',
            };
          }
          const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password,
          );
          if (isSamePassword) {
            return {
              success: false,
              message:
                'New password cannot be the same as the current password',
              errorType: 'samePassword',
            };
          }
          user.password = newPassword;
        }
        await user.save();
        context.req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        };
        // console.log('Context: ', context.req.session);

        return {
          success: true,
          message: 'User updated successfully',
          user: context.req.session.user,
        };
      } catch (error) {
        return {
          success: false,
          message: error,
        };
      }
    },
    deleteAccount: async (_: any, { id }: { id: string }) => {
      try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
          return new Error('User not found');
        }
        await Board.deleteMany({ user: id });
        await Pin.deleteMany({ user: id });
        return { success: true, message: 'Account deleted successfully' };
      } catch (err) {
        if (err instanceof Error) {
          return new Error(`Deletion failed: ${err.message}`);
        } else {
          return new Error('Deletion failed: An unknown error occurred.');
        }
      }
    },
  },
};
