import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import app from '../../src/index';
import League from '../../src/models/League';

describe('League Controller', () => {
  let leagueFindOneStub: sinon.SinonStub;
  let leagueCreateStub: sinon.SinonStub;
  let leagueFindAllStub: sinon.SinonStub;
  let leagueFindByPkStub: sinon.SinonStub;

  before(() => {
    leagueFindOneStub = sinon.stub(League, 'findOne');
    leagueCreateStub = sinon.stub(League, 'create');
    leagueFindAllStub = sinon.stub(League, 'findAll');
    leagueFindByPkStub = sinon.stub(League, 'findByPk');
  });

  after(() => {
    leagueFindOneStub.restore();
    leagueCreateStub.restore();
    leagueFindAllStub.restore();
    leagueFindByPkStub.restore();
  });

  it('should create a new league with valid data', async () => {
    const newLeague = {
      name: 'Premier League'
    };

    leagueFindOneStub.resolves(null);
    leagueCreateStub.resolves({ id: 1, name: 'Premier League' } as any);

    const response = await request(app)
      .post('/leagues')
      .send(newLeague);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(201);
    expect(response.body).to.include({ id: 1, name: 'Premier League' });
  });

  it('should not create a new league with an existing name', async () => {
    const existingLeague = {
      name: 'Premier League'
    };

    leagueFindOneStub.resolves(existingLeague);

    const response = await request(app)
      .post('/leagues')
      .send(existingLeague);

    console.log('Response body:', response.body);
    expect(response.status).to.equal(400); // Adjusting the expected status code
    expect(response.body).to.have.property('error', 'League name already exists');
  });

  it('should fetch all leagues', async () => {
    leagueFindAllStub.resolves([
      { id: 1, name: 'Premier League' },
      { id: 2, name: 'La Liga' }
    ] as any);

    const response = await request(app)
      .get('/leagues')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf(2);
    expect(response.body[0]).to.include({
      name: 'Premier League'
    });
    expect(response.body[1]).to.include({
      name: 'La Liga'
    });
  });

  it('should delete a league', async () => {
    const destroyStub = sinon.stub().resolves();

    leagueFindByPkStub.resolves({ id: 1, name: 'Premier League', destroy: destroyStub } as any);

    const response = await request(app)
      .delete('/leagues/1')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(200); // Adjusting the expected status code
    expect(response.body).to.include({
      name: 'Premier League'
    });
  });

  it('should return 404 if league not found for deletion', async () => {
    leagueFindByPkStub.resolves(null);

    const response = await request(app)
      .delete('/leagues/999')
      .send();

    console.log('Response body:', response.body);
    expect(response.status).to.equal(404);
    expect(response.body).to.have.property('error', 'League not found');
  });
});