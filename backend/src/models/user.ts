import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface UserAttributes {
  id_users: string;
  id_address: string;
  id_role: string;
  first_name: string;
  last_name: string;
  birth_years: number | null;
  country: string;
  jenis_kelamin: "L" | "P" | null;
  bio?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id_users"> {}

export default class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id_users: string;
  declare id_address: string;
  declare id_role: string;
  declare first_name: string;
  declare last_name: string;
  declare birth_years: number | null;
  declare country: string;
  declare jenis_kelamin: "L" | "P" | null;
  declare bio?: string;

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id_users: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_address: { type: DataTypes.UUID, allowNull: false },
        id_role: { type: DataTypes.UUID, allowNull: false },
        first_name: { type: DataTypes.STRING, allowNull: false },
        last_name: { type: DataTypes.STRING, allowNull: false },
        birth_years: { type: DataTypes.INTEGER, allowNull: true },
        country: { type: DataTypes.STRING, allowNull: false },
        jenis_kelamin: { type: DataTypes.ENUM("L", "P"), allowNull: true },
        bio: { type: DataTypes.TEXT },
      },
      { sequelize, tableName: "Users" }
    );
  }
}
