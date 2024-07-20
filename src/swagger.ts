import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Football Manager API',
      version: '1.0.0',
      description: 'API for managing football leagues and teams',
    },
    components: {
      schemas: {
        League: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Premier League',
            },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'Manchester United',
            },
            country: {
              type: 'string',
              example: 'England',
            },
            leagueId: {
              type: 'integer',
              example: 1,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            username: {
              type: 'string',
              example: 'testuser',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
            role: {
              type: 'string',
              example: 'user',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;