import { Table, Column, Model, PrimaryKey, AutoIncrement, Unique, AllowNull } from 'sequelize-typescript';

@Table
class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Unique
  @AllowNull(false)
  @Column
  username!: string;

  @AllowNull(false)
  @Column
  password!: string;

  @AllowNull(false)
  @Column
  role!: string;
}

export default User;
