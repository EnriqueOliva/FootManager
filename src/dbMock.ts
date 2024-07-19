import SequelizeMock from 'sequelize-mock';
import { Sequelize } from 'sequelize-typescript';

const DBConnectionMock = new SequelizeMock();

// Mock your models as you have them defined
import User from './models/User';
import League from './models/League';
import Team from './models/Team';

User.init({}, { sequelize: DBConnectionMock });
League.init({}, { sequelize: DBConnectionMock });
Team.init({}, { sequelize: DBConnectionMock });

export { DBConnectionMock, User, League, Team };