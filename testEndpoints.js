// TODO:

// Eliminar estos comentarios

// (Descripción para ser usada en documentación más adelante. Se va a eliminar)
// Flujo natural en el que los endpoints de borrar equipos y ligas borran los equipos y ligas creados
// Variables globales para gestionar token y IDs reutilizables en diferentes llamadas API
// Uso de try-catch en cada test para asegurar la ejecución completa, incluso si uno falla
// Uso de await para ejecutar los pasos de forma secuencial y asegurar dependencias correctas

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
    const response = await axios.post(`${API_URL}/leagues`, {
      name: 'Test League'
    });
    assert.strictEqual(response.status, 201);
    const leagueId = response.data.id;
    console.log('Create League (correct case): Passed');

    global.leagueId = leagueId;
  } catch (error) {
    console.log('Create League (correct case) failed:', error.response ? error.response.data : error.message);
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
    const response = await axios.delete(`${API_URL}/teams/${global.teamId}`);
    assert.strictEqual(response.status, 200);
    console.log('Delete Team by ID (correct case): Passed');
  } catch (error) {
    console.log('Delete Team by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.delete(`${API_URL}/teams/99999`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete Team by ID (incorrect case): Passed');
  }

  try {
    const response = await axios.delete(`${API_URL}/leagues/${global.leagueId}`);
    assert.strictEqual(response.status, 200);
    console.log('Delete League by ID (correct case): Passed');
  } catch (error) {
    console.log('Delete League by ID (correct case) failed:', error.response ? error.response.data : error.message);
  }

  try {
    await axios.delete(`${API_URL}/leagues/99999`);
  } catch (error) {
    assert.strictEqual(error.response.status, 404);
    console.log('Delete League by ID (incorrect case): Passed');
  }
};

testEndpoints();
