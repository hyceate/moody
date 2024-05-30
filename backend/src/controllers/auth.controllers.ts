import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { User } from '../models/user.model';
import { validateEmail, validateLength } from '../functions/validate';

export const register = async (req: Request, res: Response) => {
  try {
    // destructure from form
    const { username, email, password } = req.body;
    // Validate username length
    if (!validateLength(username)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid username.',
      });
    }
    // Validate email and password
    if (!validateEmail(email) || !validateLength(password)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid username, email or password.',
      });
    }
    // checking existing user by username and email
    // deconstruct user and email object
    const existingUserByUsername = await User.findOne({ username });
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByUsername && existingUserByEmail) {
      return res.status(409).json({
        status: 'failed',
        username: username,
        email: email,
        message: 'Account already exists under this username or email.',
      });
    } else if (existingUserByUsername) {
      return res.status(409).json({
        status: 'failed',
        username: username,
        message: 'Account already exists under this username.',
      });
    } else if (existingUserByEmail) {
      return res.status(409).json({
        status: 'failed',
        email: email,
        message: 'Account already exists under this email.',
      });
    }
    // registration
    const newUser = await User.create({
      ...req.body,
    });
    return res.status(201).json({
      status: 'success',
      message: `${newUser} created successfully.`,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res
      .status(500)
      .json({ status: 'failed', message: 'Internal server error' });
  }
};
// login
export interface CustomSessionData {
  user?: {
    id: string;
    username: string;
    // email: string;
  };
}
export const login = async (
  req: Request & { session: CustomSessionData },
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    const sessionUser = {
      id: user._id,
      username: user.username,
    };

    // Serialize user to the session
    req.session.user = sessionUser;

    // Send login success response with user data
    return res
      .status(200)
      .json({ message: 'Login successful', user: sessionUser });
  })(req, res, next);
};

export const logout = async (
  req: Request & { session: CustomSessionData },
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.session.user) {
      res.cookie('session', '', {
        maxAge: -1,
        httpOnly: true,
        secure: false,
        sameSite: false,
      }); // Expires the cookie
      // @ts-expect-error cookiesession null
      req.session = null;
      res.status(200).json({ message: 'Successfully logged out' });
    } else {
      res.status(400).json({ message: 'No session found' });
    }
  } catch (err) {
    console.error('Error destroying session:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkAuth = (
  req: Request & { session: CustomSessionData },
  res: Response,
) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).end();
  }
};
