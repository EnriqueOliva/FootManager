// TODO:

// Revisar en busca de optimizaciones


import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from './models/User';
import League from './models/League';
import Team from './models/Team';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [User, League, Team],
  pool: {
    max: 10,
    min: 1,
    acquire: 30000,
    idle: 10000
  }
});

League.hasMany(Team, { foreignKey: 'leagueId' });
Team.belongsTo(League, { foreignKey: 'leagueId' });

export default sequelize;
