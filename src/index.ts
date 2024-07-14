import express from 'express';
import dotenv from 'dotenv';
import db from './db';
import setupSwagger from './swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

setupSwagger(app);

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
app.get('/leagues', async (req, res) => {
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
app.post('/leagues', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
