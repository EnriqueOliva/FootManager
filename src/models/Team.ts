import { Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, ForeignKey } from 'sequelize-typescript';
import League from './League';

@Table
class Team extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @AllowNull(false)
  @Column
  name!: string;

  @AllowNull(false)
  @Column
  country!: string;

  @ForeignKey(() => League)
  @AllowNull(false)
  @Column
  leagueId!: number;
}

export default Team;
