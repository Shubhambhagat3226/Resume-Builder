import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/UserController.js';
import { protect } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// PROTECTED ROUTES AS TOKEN WILL BE REQUIRED
userRouter.get('/profile', protect, getUserProfile)

export default userRouter;