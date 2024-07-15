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

before(async () => {
  // Sync all models and create the necessary tables
  await sequelize.sync({ force: true });

  // Insert test user for login test
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  await User.create({ username: 'testuser', password: hashedPassword, role: 'admin' });
});

after(async () => {
  // Drop all tables
  await sequelize.drop();
});

describe('API Tests', () => {
  beforeEach(async () => {
    // Clean up before each test to ensure unique usernames
    await User.destroy({ where: { username: { [Op.ne]: 'testuser' } } });
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
