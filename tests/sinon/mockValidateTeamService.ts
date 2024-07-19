import sinon from 'sinon';
import axios from 'axios';
import { validateTeam } from '../../src/services/validateTeamService';

const mockAxiosGet = sinon.stub(axios, 'get');

const mockValidateTeam = (isValid: boolean) => {
  mockAxiosGet.resolves({
    data: {
      response: isValid
        ? [{ team: { name: 'Manchester United', country: 'England' } }]
        : [],
    },
  });
};

export { validateTeam, mockValidateTeam, mockAxiosGet };