import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

export const registerUser = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, role });
    res.status(201).json(newUser);
  } catch (err: any) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err: any) {
    console.error('Error during login:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
};