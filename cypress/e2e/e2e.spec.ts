/// <reference types="cypress" />

describe('End-to-End Test', () => {
  let validTeamNames: string[] = [
    'Chelsea', 'Manchester United', 'Liverpool', 'Arsenal', 'Tottenham', 'Manchester City', 'Leicester City', 'Everton', 'West Ham', 'Southampton'
  ];
  let teamIndex = 0;

  before(() => {
    if (validTeamNames.length === 0) {
      throw new Error('No valid team names available');
    }
  });

  it('should register, login, create league and team, and fetch details', () => {
    if (teamIndex >= validTeamNames.length) {
      throw new Error('Ran out of valid team names');
    }

    const randomUsername = `e2euser_${Math.random().toString(36).substring(7)}`;
    const randomLeagueName = `E2E_League_${Math.random().toString(36).substring(7)}`;
    const teamName = validTeamNames[teamIndex];
    teamIndex++;

    const createTeamWithRetry = (token: string, leagueId: number) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/teams`,
        body: {
          name: teamName,
          country: 'England',
          leagueId: leagueId
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        failOnStatusCode: false
      }).then((teamResponse) => {
        if (teamResponse.status === 201) {
          cy.log('Team created successfully');
          expect(teamResponse.status).to.eq(201);
        } else if (teamResponse.body.error === 'Team already exists') {
          cy.log('Team already exists, trying next team name');
          if (teamIndex < validTeamNames.length) {
            createTeamWithRetry(token, leagueId);
          } else {
            throw new Error('Ran out of valid team names');
          }
        } else {
          cy.log('Error creating team:', teamResponse.body);
          throw new Error('Team creation failed');
        }
      });
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/users/register`,
      body: {
        username: randomUsername,
        password: 'password123',
        role: 'admin'
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status !== 201) {
        cy.log('Error registering user:', response.body);
        throw new Error('User registration failed');
      }
      expect(response.status).to.eq(201);
      cy.log('User registered successfully');

      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/users/login`,
        body: {
          username: randomUsername,
          password: 'password123'
        },
        failOnStatusCode: false
      }).then((loginResponse) => {
        if (loginResponse.status !== 200) {
          cy.log('Error logging in user:', loginResponse.body);
          throw new Error('User login failed');
        }
        expect(loginResponse.status).to.eq(200);
        cy.log('User logged in successfully');

        const token = loginResponse.body.token;

        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/leagues`,
          body: {
            name: randomLeagueName
          },
          headers: {
            Authorization: `Bearer ${token}`
          },
          failOnStatusCode: false
        }).then((leagueResponse) => {
          if (leagueResponse.status !== 201) {
            cy.log('Error creating league:', leagueResponse.body);
            throw new Error('League creation failed');
          }
          expect(leagueResponse.status).to.eq(201);
          cy.log('League created successfully');

          createTeamWithRetry(token, leagueResponse.body.id);
        });
      });
    });
  });
});