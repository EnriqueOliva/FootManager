import { Request, Response } from 'express';
import League from '../models/League';

export const createLeague = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const newLeague = await League.create({ name });
    res.status(201).json(newLeague);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
};

export const getLeagues = async (req: Request, res: Response) => {
  try {
    const leagues = await League.findAll();
    res.json(leagues);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
};

export const deleteLeague = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const league = await League.findByPk(id);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    await league.destroy();
    res.json(league);
  } catch (err) {
    console.error('Error deleting league:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
};