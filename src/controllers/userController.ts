import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { validationResult } from 'express-validator';
import customError from '../utils/customError';
import logger from '../utils/logger';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new customError('Validation Error', 400, errors.array()));
  }

  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return next(new customError('Username already exists', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, role });
    res.status(201).json(newUser);
  } catch (err: any) {
    logger.error('Error registering user:', err);
    next(err);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new customError('Validation Error', 400, errors.array()));
  }

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return next(new customError('User not found', 404));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new customError('Invalid password', 401));
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err: any) {
    logger.error('Error logging in user:', err);
    next(err);
  }
};