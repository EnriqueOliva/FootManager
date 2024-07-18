const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:3000';

const generateUsername = () => `testuser_${Date.now()}`;

const testEndpoints = async () => {
  const testUsername = generateUsername();

  try {
    let response = await axios.post(`${API_URL}/register`, {
      username: testUsername,
      password: 'password123',
      role: 'user'
    });
    assert.strictEqual(response.status, 201);
    console.log('Register (correct case): Passed');
  } catch (error) {
    console.log('Register (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(`${API_URL}/register`, {
      username: testUsername,
      password: 'password123',
      role: 'user'
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 409);
    console.log('Register (incorrect case): Passed');
  }

  try {
    const response = await axios.post(`${API_URL}/login`, {
      username: testUsername,
      password: 'password123'
    });
    assert.strictEqual(response.status, 200);
    const token = response.data.token;
    console.log('Login (correct case): Passed');

    global.token = token;
  } catch (error) {
    console.log('Login (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(`${API_URL}/login`, {
      username: testUsername,
      password: 'wrongpassword'
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 400);
    console.log('Login (incorrect case): Passed');
  }

  try {
    const response = await axios.post(
      `${API_URL}/leagues`,
      { name: 'Test League' },
      { headers: { Authorization: `Bearer ${global.token}` } }
    );
    assert.strictEqual(response.status, 201);
    const leagueId = response.data.id;
    console.log('Create League (correct case): Passed');

    global.leagueId = leagueId;
  } catch (error) {
    console.log('Create League (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(`${API_URL}/leagues`, { name: 'Test League 2' });
  } catch (error) {
    assert.strictEqual(error.response.status, 401);
    console.log('Create League (incorrect case - no auth): Passed');
  }

  try {
    const response = await axios.get(`${API_URL}/leagues`);
    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    console.log('Retrieve Leagues (correct case): Passed');
  } catch (error) {
    console.log('Retrieve Leagues (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.get(`${API_URL}/wrongLeagues`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Retrieve Leagues (incorrect case): Passed');
  }

  try {
    const response = await axios.get(`${API_URL}/teams`);
    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    console.log('Retrieve Teams (correct case): Passed');
  } catch (error) {
    console.log('Retrieve Teams (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.get(`${API_URL}/wrongTeams`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Retrieve Teams (incorrect case): Passed');
  }

  try {
    const response = await axios.post(
      `${API_URL}/teams`,
      { name: 'Manchester United', country: 'England', leagueId: global.leagueId },
      { headers: { Authorization: `Bearer ${global.token}` } }
    );
    assert.strictEqual(response.status, 201);
    const teamId = response.data.id;
    console.log('Create Team (correct case): Passed');

    global.teamId = teamId;
  } catch (error) {
    console.log('Create Team (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.post(
      `${API_URL}/teams`,
      { name: 'Invalid Team', country: 'England', leagueId: 99999 },
      { headers: { Authorization: `Bearer ${global.token}` } }
    );
  } catch (error) {
    assert.strictEqual(error.response.status, 400);
    console.log('Create Team (incorrect case - invalid leagueId): Passed');
  }

  try {
    const response = await axios.get(`${API_URL}/teams/${global.teamId}`);
    assert.strictEqual(response.status, 200);
    console.log('Get Team by ID (correct case): Passed');
  } catch (error) {
    console.log('Get Team by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.get(`${API_URL}/teams/99999`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Get Team by ID (incorrect case): Passed');
  }

  try {
    const response = await axios.put(
      `${API_URL}/teams/${global.teamId}`,
      { name: 'Updated Team', country: 'Updated Country', leagueId: global.leagueId },
      { headers: { Authorization: `Bearer ${global.token}` } }
    );
    assert.strictEqual(response.status, 200);
    console.log('Update Team (correct case): Passed');
  } catch (error) {
    console.log('Update Team (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.put(
      `${API_URL}/teams/99999`,
      { name: 'Updated Team', country: 'Updated Country', leagueId: global.leagueId },
      { headers: { Authorization: `Bearer ${global.token}` } }
    );
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Update Team (incorrect case): Passed');
  }

  try {
    const response = await axios.delete(`${API_URL}/teams/${global.teamId}`, {
      headers: { Authorization: `Bearer ${global.token}` }
    });
    assert.strictEqual(response.status, 200);
    console.log('Delete Team by ID (correct case): Passed');
  } catch (error) {
    console.log('Delete Team by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.delete(`${API_URL}/teams/99999`, {
      headers: { Authorization: `Bearer ${global.token}` }
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete Team by ID (incorrect case): Passed');
  }

  try {
    const response = await axios.delete(`${API_URL}/leagues/${global.leagueId}`, {
      headers: { Authorization: `Bearer ${global.token}` }
    });
    assert.strictEqual(response.status, 200);
    console.log('Delete League by ID (correct case): Passed');
  } catch (error) {
    console.log('Delete League by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.delete(`${API_URL}/leagues/99999`, {
      headers: { Authorization: `Bearer ${global.token}` }
    });
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete League by ID (incorrect case): Passed');
  }
};

testEndpoints();

// TODO: Eliminar estos comentarios
// Flujo natural en el que los endpoints de borrar equipos y ligas borran los equipos y ligas creados
// Variables globales para gestionar token y IDs reutilizables en diferentes llamadas API
// Uso de try-catch en cada test para asegurar la ejecución completa, incluso si uno falla
// Uso de await para ejecutar los pasos de forma secuencial y asegurar dependencias correctas
