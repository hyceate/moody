import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { User } from '../models/user.model';
import { validateEmail, validateLength } from '../functions/validate';
interface UserType {
  id: string;
  username: string;
  email: string;
  password: string;
  avatarUrl: string;
}
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!validateLength(username)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid username.',
      });
    }
    if (!validateEmail(email) || !validateLength(password)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid username, email or password.',
      });
    }
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
    email: string;
    avatarUrl: string;
  };
}
export const login = async (
  req: Request & { session: CustomSessionData },
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate('local', (err: any, user: UserType, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
    return res
      .status(200)
      .json({ message: 'Login successful', user: req.session.user });
  })(req, res, next);
};

export const logout = async (
  req: Request & { session: CustomSessionData },
  res: Response,
) => {
  try {
    if (req.session) {
      res.cookie('ssid', '', {
        maxAge: -1,
        httpOnly: true,
        secure: false,
        sameSite: false,
      });
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(500).json({ message: 'Internal server error' });
        } else {
          res.status(200).json({ message: 'Successfully logged out' });
        }
      });
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
