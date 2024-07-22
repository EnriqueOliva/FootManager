import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import compression from 'compression';
import sequelize from './db';
import setupSwagger from './swagger';
import userRoutes from './routes/userRoutes';
import leagueRoutes from './routes/leagueRoutes';
import teamRoutes from './routes/teamRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('combined'));
app.use(compression());
app.use(express.json());

setupSwagger(app);

app.use('/users', userRoutes);
app.use('/leagues', leagueRoutes);
app.use('/teams', teamRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Football Manager API');
});

import League from './models/League';
import Team from './models/Team';

League.hasMany(Team, {
  foreignKey: 'leagueId',
  as: 'teams'
});
Team.belongsTo(League, {
  foreignKey: 'leagueId',
  as: 'league'
});

sequelize.addModels([League, Team]);

sequelize.sync().then(() => {
  console.log('Database & tables created!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;