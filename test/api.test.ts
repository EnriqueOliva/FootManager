// TODO: 

// Revisión completa del código


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
      await League.destroy({ where: {} });
      await Team.destroy({ where: {} });
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

  it('should not log in with invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Invalid credentials');
  });

  // League tests
  it('should create a new league', async () => {
    const response = await request(app)
      .post('/leagues')
      .send({ name: 'Premier League' });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.name).to.equal('Premier League');
  });

  it('should delete a league by ID', async () => {
    const league = await League.create({ name: 'La Liga' });

    console.log(`Created league with ID: ${league.id}`);

    const deleteResponse = await request(app)
      .delete(`/leagues/${league.id}`);

    console.log(`Delete response status: ${deleteResponse.status}`);
    console.log(`Delete response body: ${JSON.stringify(deleteResponse.body, null, 2)}`);

    expect(deleteResponse.status).to.equal(200);
    expect(deleteResponse.body.name).to.equal('La Liga');
  });

  it('should get all leagues', async () => {
    await League.create({ name: 'Bundesliga' });
    await League.create({ name: 'Serie A' });

    const response = await request(app)
      .get('/leagues');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.be.at.least(2);
  });

  // Team tests
  it('should create a new team', async () => {
    const league = await League.create({ name: 'Eredivisie' });

    const response = await request(app)
      .post('/teams')
      .send({ name: 'Ajax', country: 'Netherlands', leagueId: league.id });

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');
    expect(response.body.name).to.equal('Ajax');
  });

  it('should not create a team with invalid data', async () => {
    const response = await request(app)
      .post('/teams')
      .send({ name: 'InvalidTeam', country: 'Nowhere', leagueId: 999 });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error');
  });

  it('should update a team by ID', async () => {
    const league = await League.create({ name: 'Ligue 1' });
    const team = await Team.create({ name: 'PSG', country: 'France', leagueId: league.id });

    const response = await request(app)
      .put(`/teams/${team.id}`)
      .send({ name: 'Paris Saint-Germain', country: 'France', leagueId: league.id });

    expect(response.status).to.equal(200);
    expect(response.body.name).to.equal('Paris Saint-Germain');
  });

  it('should delete a team by ID', async () => {
    const league = await League.create({ name: 'Ligue 1' });
    const team = await Team.create({ name: 'PSG', country: 'France', leagueId: league.id });

    const response = await request(app)
      .delete(`/teams/${team.id}`);

    expect(response.status).to.equal(200);
    expect(response.body.name).to.equal('PSG');
  });

  it('should get a team by ID', async () => {
    const league = await League.create({ name: 'Liga MX' });
    const team = await Team.create({ name: 'Club América', country: 'Mexico', leagueId: league.id });

    const response = await request(app)
      .get(`/teams/${team.id}`);

    expect(response.status).to.equal(200);
    expect(response.body.name).to.equal('Club América');
  });

  it('should get all teams', async () => {
    const league = await League.create({ name: 'MLS' });
    await Team.create({ name: 'LA Galaxy', country: 'USA', leagueId: league.id });
    await Team.create({ name: 'New York Red Bulls', country: 'USA', leagueId: league.id });

    const response = await request(app)
      .get('/teams');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.be.at.least(2);
  });

  it('should get a team by ID with a country filter', async () => {
    const league = await League.create({ name: 'Liga MX' });
    const team = await Team.create({ name: 'Club América', country: 'Mexico', leagueId: league.id });
  
    const response = await request(app)
      .get(`/teams/${team.id}?country=Mexico`);
  
    expect(response.status).to.equal(200);
    expect(response.body.name).to.equal('Club América');
  
    // Attempt to get the team with a different country filter
    const wrongCountryResponse = await request(app)
      .get(`/teams/${team.id}?country=USA`);
  
    expect(wrongCountryResponse.status).to.equal(404);
  });

  it('should access protected route with valid token', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });
  
    const token = loginResponse.body.token;
  
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
  
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('Access granted');
  });
  
  it('should not access protected route with invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');
  
    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('Invalid token');
  });  
  
});