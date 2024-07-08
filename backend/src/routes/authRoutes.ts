import { Router, Request, Response } from 'express';
import {
  register,
  login,
  logout,
  checkAuth,
} from '../controllers/auth.controllers';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/user', checkAuth);

export default authRouter;
