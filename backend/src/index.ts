import express, { Application, Request, Response } from 'express';
import mongoose from './db';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import multer from 'multer';
import {
  processAvatar,
  processUploadedFile,
  upload,
  uploadPin,
} from './functions/multer';
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

const startGraphQLYogaServer = async () => {
  const app = express() as Application;
  const httpServer = createServer(app);
  app.use(
    cors({
      origin: ['http://localhost:5173'],
      methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
      credentials: true,
    }),
  );
  app.use(express.json());
  const username = process.env.MONGODB_ADMINUSERNAME;
  const password = process.env.MONGODB_ADMINPASSWORD;
  const uri = `mongodb://${username}:${password}@localhost:27017/moody`;
  app.use(
    session({
      secret: 'your-secret-key',
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({ mongoUrl: uri }),
      cookie: {
        sameSite: 'lax',
        secure: false,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 day expiration
      },
      name: 'ssid',
    }),
  );

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
  app.use((req, res, next) => {
    console.log('Session middleware check:', req.session);
    next();
  });
  // Routes
  app.get('/', (req: Request, res: Response) => {
    res.send('server running');
    console.log('Session: ', req.session);
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
      avatarUrl: string;
      id: string;
      username: string;
    };
  }
  app.post(
    '/api/auth/upload',
    async (req: Request & { session: CustomSessionData }, res: Response) => {
      try {
        // Check if user is authenticated
        if (!(req.session && req.session.user)) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.session.user.id;

        const upload = uploadPin(userId).single('imgFile');
        upload(req, res, async (err: any) => {
          if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ message: 'Error uploading file' });
          }

          if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
          }

          try {
            const fileProcessingResult = await processUploadedFile(
              req.file,
              userId,
            );
            res.status(200).json(fileProcessingResult); // Respond with processed file information
          } catch (error) {
            console.error('Error processing file:', error);
            return res.status(500).json({ message: 'Error processing file' });
          }
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ message: 'Unexpected error' });
      }
    },
  );

  app.post(
    '/api/auth/upload-avatar',
    async (req: Request & { session: CustomSessionData }, res) => {
      if (!(req.session && req.session.user)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const userID = req.session.user.id;
      const uploader = upload(userID);

      uploader(req, res, async (err) => {
        if (err) {
          console.error('Error uploading avatar:', err);
          return res.status(500).json({ message: 'Error uploading avatar' });
        }
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
          const user = await User.findById(userID);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          const avatarPath = await processAvatar(req.file, userID);

          await user.updateAvatar('profile.webp', avatarPath);
          const updatedUser = await User.findById(
            userID,
            'id username email avatarUrl',
          );
          if (updatedUser && req.session.user) {
            req.session.user.avatarUrl = updatedUser.avatarUrl;
          }
          return res.status(200).json({
            status: 'success',
            user: updatedUser,
          });
        } catch (error) {
          console.error('Error processing avatar:', error);
          return res.status(500).json({ message: 'Error processing avatar' });
        }
      });
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
