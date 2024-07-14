import express from 'express';
import dotenv from 'dotenv';
import db from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Get all leagues
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

// Create a new league
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