import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import app from '../src/index';
import User from '../src/models/User';
import League from '../src/models/League';
import Team from '../src/models/Team';
import bcrypt from 'bcryptjs';

const mockUserCreate = sinon.stub(User, 'create');
const mockLeagueCreate = sinon.stub(League, 'create');
const mockTeamCreate = sinon.stub(Team, 'create');
const mockUserFindOne = sinon.stub(User, 'findOne');
const mockLeagueFindAll = sinon.stub(League, 'findAll');
const mockLeagueFindByPk = sinon.stub(League, 'findByPk');
const mockLeagueDestroy = sinon.stub(League.prototype, 'destroy');
const mockTeamFindAll = sinon.stub(Team, 'findAll');
const mockTeamFindByPk = sinon.stub(Team, 'findByPk');
const mockTeamDestroy = sinon.stub(Team.prototype, 'destroy');

describe('API Tests', function () {
  this.timeout(5000);

  beforeEach(() => {
    sinon.reset();
    mockUserCreate.reset();
    mockLeagueCreate.reset();
    mockTeamCreate.reset();
    mockUserFindOne.reset();
    mockLeagueFindAll.reset();
    mockLeagueFindByPk.reset();
    mockLeagueDestroy.reset();
    mockTeamFindAll.reset();
    mockTeamFindByPk.reset();
    mockTeamDestroy.reset();
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      mockUserCreate.resolves({ id: 1, username: 'testuser', password: 'password123', role: 'user' } as User);

      const res = await request(app)
        .post('/users/register')
        .send({ username: 'testuser', password: 'password123', role: 'user' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('username', 'testuser');
    });

    it('should not register a user with an existing username', async () => {
      mockUserFindOne.resolves({ id: 1, username: 'testuser', password: 'password123', role: 'user' } as User);

      const res = await request(app)
        .post('/users/register')
        .send({ username: 'testuser', password: 'password123', role: 'user' });

      expect(res.status).to.equal(409);
    });
  });

  describe('User Login', () => {
    it('should login a user with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserFindOne.resolves({ id: 1, username: 'testuser', password: hashedPassword, role: 'user' } as User);

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Login successful');
      expect(res.body.user).to.have.property('username', 'testuser');
    });

    it('should not login a user with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserFindOne.resolves({ id: 1, username: 'testuser', password: hashedPassword, role: 'user' } as User);

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Invalid password');
    });

    it('should not login a non-existent user', async () => {
      mockUserFindOne.resolves(null);

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'nonexistentuser', password: 'password123' });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error', 'User not found');
    });
  });

  describe('League Management', () => {
    it('should retrieve a list of leagues', async () => {
      mockLeagueFindAll.resolves([{ id: 1, name: 'Premier League' }] as League[]);

      const res = await request(app).get('/leagues');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('name', 'Premier League');
    });

    it('should create a new league', async () => {
      mockLeagueCreate.resolves({ id: 1, name: 'La Liga' } as League);

      const res = await request(app)
        .post('/leagues')
        .send({ name: 'La Liga' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('name', 'La Liga');
    });

    it('should not create a new league with an existing name', async () => {
      mockLeagueFindAll.resolves([{ id: 1, name: 'Premier League' }] as League[]);
      mockLeagueCreate.rejects(new Error('League name already exists'));

      const res = await request(app)
        .post('/leagues')
        .send({ name: 'Premier League' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'League name already exists');
    });

    it('should not create a new league with an invalid name', async () => {
      const res = await request(app)
        .post('/leagues')
        .send({ name: ' ' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid league name');
    });

    it('should delete a league by ID', async () => {
      const league = League.build({ id: 1, name: 'Bundesliga' });
      mockLeagueFindByPk.resolves(league);
      mockLeagueDestroy.resolves();

      const res = await request(app).delete('/leagues/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', 'Bundesliga');
    });
  });

  describe('Team Management', () => {
    it('should retrieve a list of teams', async () => {
      mockTeamFindAll.resolves([{ id: 1, name: 'FC Barcelona', country: 'Spain', leagueId: 1 }] as Team[]);

      const res = await request(app).get('/teams');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('name', 'FC Barcelona');
    });

    it('should create a new team', async () => {
      mockTeamCreate.resolves({ id: 1, name: 'Real Madrid', country: 'Spain', leagueId: 1 } as Team);

      const res = await request(app)
        .post('/teams')
        .send({ name: 'Real Madrid', country: 'Spain', leagueId: 1 });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('name', 'Real Madrid');
    });

    it('should get a team by ID', async () => {
      mockTeamFindByPk.resolves({ id: 1, name: 'Atletico Madrid', country: 'Spain', leagueId: 1 } as Team);

      const res = await request(app).get('/teams/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', 'Atletico Madrid');
    });

    it('should get teams by country', async () => {
      mockTeamFindAll.resolves([
        { id: 1, name: 'Real Madrid', country: 'Spain', leagueId: 1 } as Team,
        { id: 2, name: 'FC Barcelona', country: 'Spain', leagueId: 1 } as Team,
      ]);

      const res = await request(app).get('/teams').query({ country: 'Spain' });

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
      expect(res.body[0]).to.have.property('country', 'Spain');
      expect(res.body[1]).to.have.property('country', 'Spain');
    });

    it('should delete a team by ID', async () => {
      const team = Team.build({ id: 1, name: 'Valencia CF', country: 'Spain', leagueId: 1 });
      mockTeamFindByPk.resolves(team);
      mockTeamDestroy.resolves();

      const res = await request(app).delete('/teams/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', 'Valencia CF');
    });
  });
});