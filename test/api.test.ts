import request from 'supertest';
import { expect } from 'chai';
import app from '../src/index';
import bcrypt from 'bcryptjs';
import { Sequelize, Op } from 'sequelize';
import { Sequelize as SequelizeTS } from 'sequelize-typescript';
import User from '../src/models/User';
import League from '../src/models/League';
import Team from '../src/models/Team';

const sequelize = new SequelizeTS({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [User, League, Team],
});

const dropAllTablesAndSequences = async () => {
  console.log('Dropping all tables and sequences...');
  try {
    await sequelize.query('DROP TABLE IF EXISTS "Teams" CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS "Leagues" CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS "Users" CASCADE');
    await sequelize.query('DROP SEQUENCE IF EXISTS "Users_id_seq" CASCADE');
    await sequelize.query('DROP SEQUENCE IF EXISTS "Leagues_id_seq" CASCADE');
    await sequelize.query('DROP SEQUENCE IF EXISTS "Teams_id_seq" CASCADE');
    console.log('All tables and sequences dropped.');
  } catch (error) {
    console.error('Error dropping tables and sequences:', error);
  }
};

const syncAllTables = async () => {
  console.log('Syncing all tables...');
  try {
    await sequelize.sync({ force: true });
    console.log('All tables synced.');
  } catch (error) {
    console.error('Error syncing tables:', error);
  }
};

before(async () => {
  try {
    await dropAllTablesAndSequences();
    await syncAllTables();

    console.log('Inserting test user...');
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await User.create({ username: 'testuser', password: hashedPassword, role: 'admin' });
    console.log('Test user inserted.');
  } catch (error) {
    console.error('Error in before hook:', error);
    throw error; // Ensure the test stops if setup fails
  }
});

after(async () => {
  try {
    await dropAllTablesAndSequences();
    console.log('All tables and sequences dropped after tests.');
  } catch (error) {
    console.error('Error in after hook:', error);
    throw error; // Ensure the test stops if teardown fails
  }
});

describe('API Tests', () => {
  beforeEach(async () => {
    try {
      console.log('Cleaning up before each test...');
      await User.destroy({ where: { username: { [Op.ne]: 'testuser' } } });
      console.log('Cleaned up before each test.');
    } catch (error) {
      console.error('Error in beforeEach hook:', error);
      throw error; // Ensure the test stops if cleanup fails
    }
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'uniqueuser', password: 'password123', role: 'admin' });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.username).to.equal('uniqueuser');
  });

  it('should not register a user with an existing username', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'password123', role: 'admin' });

    expect(response.status).to.equal(409);
    expect(response.body.error).to.equal('Username already exists');
  });

  it('should log in a user', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
  });
});
