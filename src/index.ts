import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import compression from 'compression';
import sequelize from './db';
import setupSwagger from './swagger';
import userRoutes from './routes/userRoutes';
import leagueRoutes from './routes/leagueRoutes';
import teamRoutes from './routes/teamRoutes';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure morgan to use Winston for logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(compression());
app.use(express.json());

setupSwagger(app);

app.use('/users', userRoutes);
app.use('/leagues', leagueRoutes);
app.use('/teams', teamRoutes);

// Use error handler middleware
app.use(errorHandler);

sequelize.sync().then(() => {
  console.log('Database & tables created!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;