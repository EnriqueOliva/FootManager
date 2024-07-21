import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import request from 'supertest';
import app from '../../src/index';
import Team from '../../src/models/Team';

describe('Team Controller', () => {
  let teamFindOneStub: sinon.SinonStub;
  let teamCreateStub: sinon.SinonStub;
  let teamFindAllStub: sinon.SinonStub;
  let teamFindByPkStub: sinon.SinonStub;
  let teamUpdateStub: sinon.SinonStub;

  before(() => {
    sinon.stub(axios, 'get').resolves({ data: { response: [{ team: { name: 'Valid Team', country: 'Valid Country' } }] } });
    teamFindOneStub = sinon.stub(Team, 'findOne');
    teamCreateStub = sinon.stub(Team, 'create');
    teamFindAllStub = sinon.stub(Team, 'findAll');
    teamFindByPkStub = sinon.stub(Team, 'findByPk');
    teamUpdateStub = sinon.stub(Team, 'update');
  });

  after(() => {
    (axios.get as sinon.SinonStub).restore();
    teamFindOneStub.restore();
    teamCreateStub.restore();
    teamFindAllStub.restore();
    teamFindByPkStub.restore();
    teamUpdateStub.restore();
  });

  it('should create a new team with valid data', async () => {
    const newTeamData = {
      name: 'Valid Team',
      country: 'Valid Country',
      leagueId: 1
    };

    teamCreateStub.resolves({ id: 1, name: 'Valid Team', country: 'Valid Country', leagueId: 1 } as any);

    const response = await request(app)
      .post('/teams')
      .send(newTeamData);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      name: 'Valid Team',
      country: 'Valid Country',
      leagueId: 1
    });
  });

  it('should not create a new team with invalid data', async () => {
    const invalidTeamData = {
      name: 'Invalid Team',
      country: 'Invalid Country',
      leagueId: 1
    };

    (axios.get as sinon.SinonStub).resolves({ data: { response: [] } });

    const response = await request(app)
      .post('/teams')
      .send(invalidTeamData);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('error', 'Invalid team');
  });

  it('should fetch all teams', async () => {
    teamFindAllStub.resolves([
      { id: 1, name: 'Team A', country: 'Country A', leagueId: 1 },
      { id: 2, name: 'Team B', country: 'Country B', leagueId: 1 }
    ] as any);

    const response = await request(app)
      .get('/teams')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(2);
    expect(response.body[0]).to.include({
      name: 'Team A',
      country: 'Country A'
    });
    expect(response.body[1]).to.include({
      name: 'Team B',
      country: 'Country B'
    });
  });

  it('should fetch a team by ID', async () => {
    const destroyStub = sinon.stub().resolves();

    teamFindByPkStub.resolves({ id: 1, name: 'Team A', country: 'Country A', leagueId: 1, destroy: destroyStub } as any);

    const response = await request(app)
      .get('/teams/1')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      id: 1,
      name: 'Team A',
      country: 'Country A',
      leagueId: 1
    });
  });

  it('should return 404 if team not found by ID', async () => {
    teamFindByPkStub.resolves(null);

    const response = await request(app)
      .get('/teams/999')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'Team not found');
  });

  it('should update a team', async () => {
    const updatedTeamData = {
      name: 'Updated Team',
      country: 'Updated Country',
      leagueId: 1
    };

    teamUpdateStub.resolves([1, [{ id: 1, name: 'Updated Team', country: 'Updated Country', leagueId: 1 } as any]]);

    const response = await request(app)
      .put('/teams/1')
      .send(updatedTeamData);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      name: 'Updated Team',
      country: 'Updated Country'
    });
  });

  it('should return 404 if team not found for update', async () => {
    teamUpdateStub.resolves([0, []]);

    const response = await request(app)
      .put('/teams/999')
      .send({
        name: 'Updated Team',
        country: 'Updated Country',
        leagueId: 1
      });

    console.log('Response body:', response.body);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'Team not found');
  });

  it('should delete a team', async () => {
    const destroyStub = sinon.stub().resolves();

    teamFindByPkStub.resolves({ id: 1, name: 'Team A', country: 'Country A', leagueId: 1, destroy: destroyStub } as any);

    const response = await request(app)
      .delete('/teams/1')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      name: 'Team A',
      country: 'Country A'
    });
  });

  it('should return 404 if team not found for deletion', async () => {
    teamFindByPkStub.resolves(null);

    const response = await request(app)
      .delete('/teams/999')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'Team not found');
  });
});