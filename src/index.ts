// TODO:

// Revisar en busca de optimizaciones
//// Código innecesario
//// Código innecesariamente largo
//// Dividir en archivos más pequeños y claros
//// Asegurar buena escalabilidad

// Revisar relación entre tablas

// Revisión de implementación de middlewares
//// Revisión de JWT

//Revisión de sequelize

// Eliminar comentarios


import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import sequelize from './db';
import setupSwagger from './swagger';
import User from './models/User';
import League from './models/League';
import Team from './models/Team';
import morgan from 'morgan';
import compression from 'compression';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Use morgan for logging requests
app.use(morgan('combined'));

// Use compression for response compression
app.use(compression());

app.use(express.json());

setupSwagger(app);

// Initialize Sequelize
sequelize.sync().then(() => {
  console.log('Database & tables created!');
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || 'your_api_football_key';

// Function to validate team using API-Football
const validateTeam = async (name: string, country: string) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/teams', {
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_FOOTBALL_KEY
      },
      params: {
        search: name
      }
    });

    const teams = response.data.response;
    return teams.some((team: any) => team.team.name.toLowerCase() === name.toLowerCase() && team.team.country.toLowerCase() === country.toLowerCase());
  } catch (error: any) {
    console.error('Error validating team:', error.response ? error.response.data : error.message);
    return false;
  }
};

// User registration endpoint
app.post('/register', async (req: Request, res: Response) => {
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
});

// User login endpoint
app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Middleware to protect routes
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    (req as any).user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Retrieve a list of leagues
app.get('/leagues', async (req: Request, res: Response) => {
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
});

// Create a new league
app.post('/leagues', authenticateJWT, async (req: Request, res: Response) => {
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
});

// Delete a league by ID
app.delete('/leagues/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const league = await League.findByPk(id);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    await league.destroy();
    res.json(league);
  } catch (err: unknown) {
    console.error('Error deleting league:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Retrieve a list of teams
app.get('/teams', async (req: Request, res: Response) => {
  try {
    const teams = await Team.findAll();
    res.json(teams);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Create a new team
app.post('/teams', authenticateJWT, async (req: Request, res: Response) => {
  const { name, country, leagueId } = req.body;
  try {
    const isValidTeam = await validateTeam(name, country);
    if (!isValidTeam) {
      return res.status(400).json({ error: 'Invalid team' });
    }
    const newTeam = await Team.create({ name, country, leagueId });
    res.status(201).json(newTeam);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Get a team by ID
app.get('/teams/:id', async (req: Request, res: Response) => {
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
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Update a team by ID
app.put('/teams/:id', authenticateJWT, async (req: Request, res: Response) => {
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
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

// Delete a team by ID
app.delete('/teams/:id', authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const team = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await Team.destroy({ where: { id } });
    res.json(team);
  } catch (err) {
    console.error('Error deleting team:', err instanceof Error ? err.message : err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
