import { Request, Response, NextFunction } from 'express';
import Team from '../models/Team';
import { validateTeam } from '../services/validateTeamService';
import customError from '../utils/customError';
import logger from '../utils/logger';

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  const { name, country, leagueId } = req.body;
  try {
    const isValidTeam = await validateTeam(name, country);
    if (!isValidTeam) {
      return next(new customError('Invalid team', 400));
    }
    const newTeam = await Team.create({ name, country, leagueId });
    res.status(201).json(newTeam);
  } catch (err: any) {
    logger.error('Error creating team:', err);
    next(err);
  }
};

export const getTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.findAll();
    res.json(teams);
  } catch (err: any) {
    logger.error('Error fetching teams:', err);
    next(err);
  }
};

export const getTeamById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { country } = req.query;

  try {
    const team = await Team.findByPk(id);

    if (!team) {
      return next(new customError('Team not found', 404));
    }

    if (country && team.country.toLowerCase() !== (country as string).toLowerCase()) {
      return next(new customError('Team not found in the specified country', 404));
    }

    res.json(team);
  } catch (err: any) {
    logger.error('Error fetching team by ID:', err);
    next(err);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, country, leagueId } = req.body;
  try {
    const updatedTeam = await Team.update(
      { name, country, leagueId },
      { where: { id }, returning: true }
    );

    if (!updatedTeam[1][0]) {
      return next(new customError('Team not found', 404));
    }

    res.json(updatedTeam[1][0]);
  } catch (err: any) {
    logger.error('Error updating team:', err);
    next(err);
  }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const team = await Team.findByPk(id);

    if (!team) {
      return next(new customError('Team not found', 404));
    }

    await Team.destroy({ where: { id } });
    res.json(team);
  } catch (err: any) {
    logger.error('Error deleting team:', err);
    next(err);
  }
};