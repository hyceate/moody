import express, { Application, Request, Response } from 'express';
import mongoose from './db';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import { createServer } from 'http';
import { createYoga } from 'graphql-yoga';

// GraphQL
import { schema } from './schema';
// Models
import { User } from './models/user.model';
// Controllers
import {
  register,
  login,
  logout,
  checkAuth,
} from './controllers/auth.controllers';
import multer from 'multer';
import { customStorage } from './functions/multer';

const startGraphQLYogaServer = async () => {
  const app = express() as Application;
  const httpServer = createServer(app);

  const yoga = createYoga({
    schema,
    graphiql: false,
  });

  app.use(
    '/api/graphql',
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }),
    bodyParser.json(),
    yoga,
  );

  // Middleware
  app.use(
    cors({
      origin: ['http://localhost:5173'],
      methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
      credentials: true,
    }),
  );

  app.use(express.json());

  app.use(
    cookieSession({
      name: 'session',
      secret: 'your_secret_key',
      sameSite: false,
      secure: false,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy.Strategy(
      { usernameField: 'email', passwordField: 'password' },
      async function (email, password, done) {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'Incorrect email / password' });
          }
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, {
              message: 'Incorrect email / password.',
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  app.use(passport.authenticate('session'));

  // Routes
  app.get('/', (req: Request, res: Response) => {
    res.send('server running');
  });

  app.get('/users/:username', async (req: Request, res: Response) => {
    try {
      const username = req.params.username;
      const user = await User.findOne({ username }, '-password -salt');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User found', user });
    } catch (error) {
      console.error('Error querying user:', error);
      res.status(500).json({ message: 'Error querying user' });
    }
  });

  interface CustomSessionData {
    user?: {
      id: string;
      username: string;
      // email: string;
    };
  }

  app.post(
    '/api/auth/upload',
    (req: Request & { session: CustomSessionData }, res) => {
      if (req.session && req.session.user) {
        const userID = req.session.user.id;
        const upload = multer({ storage: customStorage(userID) });

        upload.single('imgFile')(req, res, (err) => {
          if (req.file) {
            res
              .status(200)
              .json({ filePath: `/images/${userID}/${req.file.filename}` });
          } else return res.status(400).json({ message: 'No file uploaded' });
        });
      }
    },
  );

  app.get('/api/auth/user', checkAuth);
  app.post('/api/auth/login', login);
  app.post('/api/auth/register', register);
  app.post('/api/auth/logout', logout);

  try {
    await mongoose;
    httpServer.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit on connection error
  }
};

startGraphQLYogaServer();
