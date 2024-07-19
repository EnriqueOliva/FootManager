import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || 'your_api_football_key';

export const validateTeam = async (name: string, country: string) => {
  try {
    const response = await axios.get('https://v3.football.api-sports.io/teams', {
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_FOOTBALL_KEY
      },
      params: {
        search: name
      }
    });

    const teams = response.data.response;
    return teams.some((team: any) => team.team.name.toLowerCase() === name.toLowerCase() && team.team.country.toLowerCase() === country.toLowerCase());
  } catch (error: any) {
    console.error('Error validating team:', error.response ? error.response.data : error.message);
    return false;
  }
};