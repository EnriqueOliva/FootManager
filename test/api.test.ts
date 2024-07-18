import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import app from '../src/index'; // Adjust the path as necessary
import User from '../src/models/User';
import League from '../src/models/League';
import Team from '../src/models/Team';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';

describe('API Endpoints', () => {
  let sandbox: sinon.SinonSandbox;
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('User Registration and Login', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user'
      };

      sandbox.stub(User, 'findOne').resolves(null);
      sandbox.stub(User, 'create').resolves(mockUser as any);
      sandbox.stub(bcrypt, 'hash').resolves(mockUser.password);

      const res = await request(app)
        .post('/register')
        .send({ username: 'testuser', password: 'password', role: 'user' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('username', 'testuser');
    });

    it('should not register a user with an existing username', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'user' };

      sandbox.stub(User, 'findOne').resolves(mockUser as any);

      const res = await request(app)
        .post('/register')
        .send({ username: 'testuser', password: 'password', role: 'user' });

      expect(res.status).to.equal(409);
      expect(res.body).to.have.property('error', 'Username already exists');
    });

    it('should login a user', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'user' };

      sandbox.stub(User, 'findOne').resolves(mockUser as any);
      sandbox.stub(bcrypt, 'compare').resolves(true);
      sandbox.stub(jwt, 'sign').returns('mocktoken' as unknown as string); // Ensure correct return type

      const res = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'password' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token', 'mocktoken');
    });

    it('should not login a user with invalid credentials', async () => {
      sandbox.stub(User, 'findOne').resolves(null);

      const res = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'password' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid credentials');
    });
  });

  describe('Leagues', () => {
    it('should get a list of leagues', async () => {
      const mockLeagues = [{ id: 1, name: 'League 1' }];

      sandbox.stub(League, 'findAll').resolves(mockLeagues as any);

      const res = await request(app).get('/leagues');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1);
    });

    it('should create a new league', async () => {
      const mockLeague = { id: 1, name: 'League 1' };

      sandbox.stub(League, 'create').resolves(mockLeague as any);
      const token = jwt.sign({ userId: 1, role: 'admin' }, JWT_SECRET) as string;

      const res = await request(app)
        .post('/leagues')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'League 1' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('name', 'League 1');
    });

    it('should delete a league by ID', async () => {
      const mockLeague = { id: 1, name: 'League 1', destroy: sinon.stub().resolves() };

      sandbox.stub(League, 'findByPk').resolves(mockLeague as any);
      const token = jwt.sign({ userId: 1, role: 'admin' }, JWT_SECRET) as string;

      const res = await request(app)
        .delete('/leagues/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(mockLeague.destroy.calledOnce).to.be.true;
    });
  });

  describe('Teams', () => {
    it('should get a list of teams', async () => {
      const mockTeams = [{ id: 1, name: 'Team 1', country: 'Country 1', leagueId: 1 }];

      sandbox.stub(Team, 'findAll').resolves(mockTeams as any);

      const res = await request(app).get('/teams');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1);
    });

    it('should create a new team', async () => {
      const mockTeam = { id: 1, name: 'Team 1', country: 'Country 1', leagueId: 1 };
      sandbox.stub(Team, 'create').resolves(mockTeam as any);
      sandbox.stub(axios, 'get').resolves({ data: { response: [{ team: { name: 'Team 1', country: 'Country 1' } }] } });
      const token = jwt.sign({ userId: 1, role: 'admin' }, JWT_SECRET) as string;

      const res = await request(app)
        .post('/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Team 1', country: 'Country 1', leagueId: 1 });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('name', 'Team 1');
    });

    it('should get a team by ID', async () => {
      const mockTeam = { id: 1, name: 'Team 1', country: 'Country 1', leagueId: 1 };

      sandbox.stub(Team, 'findByPk').resolves(mockTeam as any);

      const res = await request(app).get('/teams/1');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', 'Team 1');
    });

    it('should update a team by ID', async () => {
      const mockTeam = { id: 1, name: 'Team 1', country: 'Country 1', leagueId: 1 };

      sandbox.stub(Team, 'update').resolves([1, [mockTeam as any]]);
      const token = jwt.sign({ userId: 1, role: 'admin' }, JWT_SECRET) as string;

      const res = await request(app)
        .put('/teams/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Team', country: 'Updated Country', leagueId: 1 });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', 'Team 1');
    });

    it('should delete a team by ID', async () => {
      const mockTeam = { id: 1, name: 'Team 1', country: 'Country 1', leagueId: 1 };

      sandbox.stub(Team, 'findByPk').resolves(mockTeam as any);
      sandbox.stub(Team, 'destroy').resolves(1);
      const token = jwt.sign({ userId: 1, role: 'admin' }, JWT_SECRET) as string;

      const res = await request(app)
        .delete('/teams/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
    });
  });
});
