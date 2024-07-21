import { Request, Response } from 'express';
import Team from '../models/Team';
import { validateTeam } from '../services/validateTeamService';

export const createTeam = async (req: Request, res: Response) => {
  const { name, country, leagueId } = req.body;
  try {
    const isValidTeam = await validateTeam(name, country);
    if (!isValidTeam) {
      return res.status(400).json({ error: 'Invalid team' });
    }
    const newTeam = await Team.create({ name, country, leagueId });
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await Team.findAll();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { country } = req.query;

  try {
    const team = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (country && team.country.toLowerCase() !== (country as string).toLowerCase()) {
      return res.status(404).json({ error: 'Team not found in the specified country' });
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, country, leagueId } = req.body;
  try {
    const updatedTeam = await Team.update(
      { name, country, leagueId },
      { where: { id }, returning: true }
    );

    if (!updatedTeam[1][0]) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(updatedTeam[1][0]);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const team = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await team.destroy();
    res.json(team);
  } catch (err) {
    console.error('Error deleting team:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
};