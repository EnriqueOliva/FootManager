import axios from 'axios';
import assert from 'assert';

const API_URL = 'http://localhost:3000';

const generateUsername = (): string => `testuser_${Date.now()}`;

const testEndpoints = async (): Promise<void> => {
  const testUsername = generateUsername();

  try {
    const response = await axios.post(`${API_URL}/users/register`, {
      username: testUsername,
      password: 'password123',
      role: 'user'
    });
    assert.strictEqual(response.status, 201);
    console.log('Register (correct case): Passed');
  } catch (error: any) {
    console.log('Register (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(`${API_URL}/users/register`, {
      username: testUsername,
      password: 'password123',
      role: 'user'
    });
  } catch (error: any) {
    assert.strictEqual(error.response.status, 409);
    console.log('Register (incorrect case): Passed');
  }

  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      username: testUsername,
      password: 'password123'
    });
    assert.strictEqual(response.status, 200);
    console.log('Login (correct case): Passed');
  } catch (error: any) {
    console.log('Login (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(`${API_URL}/users/login`, {
      username: testUsername,
      password: 'wrongpassword'
    });
  } catch (error: any) {
    assert.strictEqual(error.response.status, 401);
    console.log('Login (incorrect case): Passed');
  }

  try {
    const response = await axios.post(`${API_URL}/leagues`, {
      name: `Test League ${Date.now()}`
    });
    assert.strictEqual(response.status, 201);
    const leagueId = response.data.id;
    console.log('Create League (correct case): Passed');

    (global as any).leagueId = leagueId;
  } catch (error: any) {
    console.log('Create League (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(`${API_URL}/leagues`, {
      name: ' '
    });
  } catch (error: any) {
    assert.strictEqual(error.response.status, 400);
    console.log('Create League (incorrect case): Passed');
  }

  try {
    const response = await axios.get(`${API_URL}/leagues`);
    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    console.log('Retrieve Leagues (correct case): Passed');
  } catch (error: any) {
    console.log('Retrieve Leagues (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.get(`${API_URL}/wrongLeagues`);
  } catch (error: any) {
    assert.strictEqual(error.response.status, 404);
    console.log('Retrieve Leagues (incorrect case): Passed');
  }

  try {
    const response = await axios.get(`${API_URL}/teams`);
    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    console.log('Retrieve Teams (correct case): Passed');
  } catch (error: any) {
    console.log('Retrieve Teams (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.get(`${API_URL}/wrongTeams`);
  } catch (error: any) {
    assert.strictEqual(error.response.status, 404);
    console.log('Retrieve Teams (incorrect case): Passed');
  }

  try {
    const response = await axios.post(`${API_URL}/teams`, {
      name: 'Manchester United',
      country: 'England',
      leagueId: (global as any).leagueId
    });
    assert.strictEqual(response.status, 201);
    const teamId = response.data.id;
    console.log('Create Team (correct case): Passed');

    (global as any).teamId = teamId;
  } catch (error: any) {
    console.log('Create Team (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(`${API_URL}/teams`, {
      name: 'Invalid Team',
      country: 'England',
      leagueId: 99999
    });
  } catch (error: any) {
    assert.strictEqual(error.response.status, 400);
    console.log('Create Team (incorrect case - invalid leagueId): Passed');
  }

  try {
    const response = await axios.get(`${API_URL}/teams/${(global as any).teamId}`);
    assert.strictEqual(response.status, 200);
    console.log('Get Team by ID (correct case): Passed');
  } catch (error: any) {
    console.log('Get Team by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.get(`${API_URL}/teams/99999`);
  } catch (error: any) {
    assert.strictEqual(error.response.status, 404);
    console.log('Get Team by ID (incorrect case): Passed');
  }

  try {
    const response = await axios.delete(`${API_URL}/teams/${(global as any).teamId}`);
    assert.strictEqual(response.status, 200);
    console.log('Delete Team by ID (correct case): Passed');
  } catch (error: any) {
    console.log('Delete Team by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.delete(`${API_URL}/teams/99999`);
  } catch (error: any) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete Team by ID (incorrect case): Passed');
  }

  try {
    const response = await axios.delete(`${API_URL}/leagues/${(global as any).leagueId}`);
    assert.strictEqual(response.status, 200);
    console.log('Delete League by ID (correct case): Passed');
  } catch (error: any) {
    console.log('Delete League by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.delete(`${API_URL}/leagues/99999`);
  } catch (error: any) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete League by ID (incorrect case): Passed');
  }
};

testEndpoints();