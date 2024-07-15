import request from 'supertest';
import { expect } from 'chai';
import app from '../src/index';
import db from '../src/db'; // Ensure the database connection is imported
import bcrypt from 'bcryptjs'; // Import bcryptjs

before(async () => {
  // Create the users table and add testuser
  await db.none(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS leagues (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      country VARCHAR(50) NOT NULL,
      league_id INTEGER REFERENCES leagues(id)
    );
  `);

  // Insert test user for login test
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  await db.none('INSERT INTO users(username, password, role) VALUES($1, $2, $3) ON CONFLICT (username) DO NOTHING', ['testuser', hashedPassword, 'admin']);
});

after(async () => {
  // Drop the teams table first because it has a foreign key dependency on the leagues table
  await db.none(`
    DROP TABLE IF EXISTS teams;
    DROP TABLE IF EXISTS leagues;
    DROP TABLE IF EXISTS users;
  `);
});

describe('API Tests', () => {
  beforeEach(async () => {
    // Clean up before each test to ensure unique usernames
    await db.none('DELETE FROM users WHERE username != $1', ['testuser']);
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
