import { User } from '../models/user.model';
import { Board } from '../models/board.model';
import { Pin } from '../models/pin.model';
import { validateEmail, validateLength } from '../functions/validate';
interface SignUpInput {
  username: string;
  email: string;
  password: string;
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
        // Check if user with given username or email already exists
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
        return { success: true, user: newUser };
      } catch (error: unknown) {
        return {
          success: false,
          message: 'Signup failed: An unknown error occurred.',
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
