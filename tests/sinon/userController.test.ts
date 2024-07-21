import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/index';
import User from '../../src/models/User';

describe('User Controller', () => {
  let userFindOneStub: sinon.SinonStub;
  let userCreateStub: sinon.SinonStub;

  before(() => {
    userFindOneStub = sinon.stub(User, 'findOne');
    userCreateStub = sinon.stub(User, 'create');
  });

  after(() => {
    userFindOneStub.restore();
    userCreateStub.restore();
  });

  it('should register a new user with valid data', async () => {
    const newUser = {
      username: 'testuser',
      password: 'password123',
      role: 'admin'
    };

    userFindOneStub.resolves(null);
    userCreateStub.resolves({ id: 1, username: 'testuser', role: 'admin' } as any);

    const response = await request(app)
      .post('/users/register')
      .send(newUser);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(201);
    expect(response.body).to.include({ id: 1, username: 'testuser', role: 'admin' });
  });

  it('should not register a user with an existing username', async () => {
    const existingUser = {
      username: 'testuser',
      password: 'password123',
      role: 'admin'
    };

    userFindOneStub.resolves(existingUser);

    const response = await request(app)
      .post('/users/register')
      .send(existingUser);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(409);
    expect(response.body).to.have.property('error', 'Username already exists');
  });

  it('should login a user with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    userFindOneStub.resolves({ id: 1, username: 'testuser', password: hashedPassword } as any);

    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    const response = await request(app)
      .post('/users/login')
      .send(loginData);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message', 'Login successful');
  });

  it('should not login a user with invalid credentials', async () => {
    userFindOneStub.resolves(null);

    const loginData = {
      username: 'testuser',
      password: 'password123'
    };

    const response = await request(app)
      .post('/users/login')
      .send(loginData);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'User not found');
  });
});