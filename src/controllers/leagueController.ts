import { Request, Response, NextFunction } from 'express';
import League from '../models/League';
import customError from '../utils/customError';
import logger from '../utils/logger';

export const createLeague = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  try {
    if (!name.trim()) {
      return next(new customError('Invalid league name', 400));
    }
    const existingLeague = await League.findOne({ where: { name } });
    if (existingLeague) {
      return next(new customError('League name already exists', 400));
    }
    const newLeague = await League.create({ name });
    res.status(201).json(newLeague);
  } catch (err: any) {
    logger.error('Error creating league:', err);
    next(err);
  }
};

export const getLeagues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagues = await League.findAll();
    res.json(leagues);
  } catch (err: any) {
    logger.error('Error fetching leagues:', err);
    next(err);
  }
};

export const deleteLeague = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const league = await League.findByPk(id);
    if (!league) {
      return next(new customError('League not found', 404));
    }
    await league.destroy();
    res.json(league);
  } catch (err: any) {
    logger.error('Error deleting league:', err);
    next(err);
  }
};