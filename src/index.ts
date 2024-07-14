import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import db from './db';
import setupSwagger from './swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

setupSwagger(app);

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

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 */
app.post('/register', async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.one(
      'INSERT INTO users(username, password, role) VALUES($1, $2, $3) RETURNING *',
      [username, hashedPassword, role]
    );
    res.status(201).json(newUser);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: The authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await db.one('SELECT * FROM users WHERE username = $1', [username]);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
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

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: A protected route
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 */
app.get('/protected', authenticateJWT, (req: Request, res: Response) => {
  res.send('Access granted');
});

/**
 * @swagger
 * /leagues:
 *   get:
 *     summary: Retrieve a list of leagues
 *     responses:
 *       200:
 *         description: A list of leagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
app.get('/leagues', async (req: Request, res: Response) => {
  try {
    const leagues = await db.any('SELECT * FROM leagues');
    res.json(leagues);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /leagues:
 *   post:
 *     summary: Create a new league
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created league
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 */
app.post('/leagues', async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const newLeague = await db.one(
      'INSERT INTO leagues(name) VALUES($1) RETURNING *',
      [name]
    );
    res.status(201).json(newLeague);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Retrieve a list of teams
 *     responses:
 *       200:
 *         description: A list of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   country:
 *                     type: string
 *                   league_id:
 *                     type: integer
 */
app.get('/teams', async (req: Request, res: Response) => {
  try {
    const teams = await db.any('SELECT * FROM teams');
    res.json(teams);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               league_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The created team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 country:
 *                   type: string
 *                 league_id:
 *                   type: integer
 */
app.post('/teams', async (req: Request, res: Response) => {
  const { name, country, league_id } = req.body;
  try {
    const isValidTeam = await validateTeam(name, country);
    if (!isValidTeam) {
      return res.status(400).json({ error: 'Invalid team' });
    }
    const newTeam = await db.one(
      'INSERT INTO teams(name, country, league_id) VALUES($1, $2, $3) RETURNING *',
      [name, country, league_id]
    );
    res.status(201).json(newTeam);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     responses:
 *       200:
 *         description: A team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 country:
 *                   type: string
 *                 league_id:
 *                   type: integer
 */
app.get('/teams/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const team = await db.one('SELECT * FROM teams WHERE id = $1', [id]);
    res.json(team);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update a team by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               league_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 country:
 *                   type: string
 *                 league_id:
 *                   type: integer
 */
app.put('/teams/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, country, league_id } = req.body;
  try {
    const updatedTeam = await db.one(
      'UPDATE teams SET name = $1, country = $2, league_id = $3 WHERE id = $4 RETURNING *',
      [name, country, league_id, id]
    );
    res.json(updatedTeam);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
});

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The deleted team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 country:
 *                   type: string
 *                 league_id:
 *                   type: integer
 */
app.delete('/teams/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedTeam = await db.one('DELETE FROM teams WHERE id = $1 RETURNING *', [id]);
    res.json(deletedTeam);
  } catch (err) {
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
