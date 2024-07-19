const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:3000';

const generateUsername = () => `testuser_${Date.now()}`;

const testEndpoints = async () => {
  const testUsername = generateUsername();

  // Register user (correct case)
  try {
    let response = await axios.post(`${API_URL}/users/register`, {
      username: testUsername,
      password: 'password123',
      role: 'user'
    });
    assert.strictEqual(response.status, 201);
    console.log('Register (correct case): Passed');
  } catch (error) {
    console.log('Register (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Register user (incorrect case)
  try {
    await axios.post(`${API_URL}/users/register`, {
      username: testUsername,
      password: 'password123',
      role: 'user'
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 409);
    console.log('Register (incorrect case): Passed');
  }

  // Login user (correct case)
  try {
    let response = await axios.post(`${API_URL}/users/login`, {
      username: testUsername,
      password: 'password123'
    });
    assert.strictEqual(response.status, 200);
    console.log('Login (correct case): Passed');
  } catch (error) {
    console.log('Login (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Login user (incorrect case)
  try {
    await axios.post(`${API_URL}/users/login`, {
      username: testUsername,
      password: 'wrongpassword'
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 401);
    console.log('Login (incorrect case): Passed');
  }

  // Create league (correct case)
  try {
    const response = await axios.post(`${API_URL}/leagues`, {
      name: `Test League ${Date.now()}`
    });
    assert.strictEqual(response.status, 201);
    const leagueId = response.data.id;
    console.log('Create League (correct case): Passed');

    global.leagueId = leagueId;
  } catch (error) {
    console.log('Create League (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Create league (incorrect case - invalid name)
  try {
    await axios.post(`${API_URL}/leagues`, {
      name: ' ' // This should fail due to validation error (name only contains spaces)
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 400);
    console.log('Create League (incorrect case): Passed');
  }

  // Retrieve leagues (correct case)
  try {
    const response = await axios.get(`${API_URL}/leagues`);
    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    console.log('Retrieve Leagues (correct case): Passed');
  } catch (error) {
    console.log('Retrieve Leagues (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Retrieve leagues (incorrect case)
  try {
    await axios.get(`${API_URL}/wrongLeagues`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Retrieve Leagues (incorrect case): Passed');
  }

  // Retrieve teams (correct case)
  try {
    const response = await axios.get(`${API_URL}/teams`);
    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    console.log('Retrieve Teams (correct case): Passed');
  } catch (error) {
    console.log('Retrieve Teams (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Retrieve teams (incorrect case)
  try {
    await axios.get(`${API_URL}/wrongTeams`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Retrieve Teams (incorrect case): Passed');
  }

  // Create team (correct case)
  try {
    const response = await axios.post(`${API_URL}/teams`, {
      name: 'Manchester United',
      country: 'England',
      leagueId: global.leagueId
    });
    assert.strictEqual(response.status, 201);
    const teamId = response.data.id;
    console.log('Create Team (correct case): Passed');

    global.teamId = teamId;
  } catch (error) {
    console.log('Create Team (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Create team (incorrect case - invalid leagueId)
  try {
    await axios.post(`${API_URL}/teams`, {
      name: 'Invalid Team',
      country: 'England',
      leagueId: 99999
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 400);
    console.log('Create Team (incorrect case - invalid leagueId): Passed');
  }

  // Get team by ID (correct case)
  try {
    const response = await axios.get(`${API_URL}/teams/${global.teamId}`);
    assert.strictEqual(response.status, 200);
    console.log('Get Team by ID (correct case): Passed');
  } catch (error) {
    console.log('Get Team by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Get team by ID (incorrect case)
  try {
    await axios.get(`${API_URL}/teams/99999`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Get Team by ID (incorrect case): Passed');
  }

  // Delete team by ID (correct case)
  try {
    const response = await axios.delete(`${API_URL}/teams/${global.teamId}`);
    assert.strictEqual(response.status, 200);
    console.log('Delete Team by ID (correct case): Passed');
  } catch (error) {
    console.log('Delete Team by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Delete team by ID (incorrect case)
  try {
    await axios.delete(`${API_URL}/teams/99999`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete Team by ID (incorrect case): Passed');
  }

  // Delete league by ID (correct case)
  try {
    const response = await axios.delete(`${API_URL}/leagues/${global.leagueId}`);
    assert.strictEqual(response.status, 200);
    console.log('Delete League by ID (correct case): Passed');
  } catch (error) {
    console.log('Delete League by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  // Delete league by ID (incorrect case)
  try {
    await axios.delete(`${API_URL}/leagues/99999`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete League by ID (incorrect case): Passed');
  }
};

testEndpoints();