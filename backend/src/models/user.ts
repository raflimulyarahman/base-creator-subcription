import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface UserAttributes {
  id_users: string;
  id_address: string;
  id_role: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  birth_years: number | null;
  country: string;
  jenis_kelamin: "F" | "M" | null;
  bio?: string;
  foto?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes,  "id_users" | "email" | "username"> {}

export default class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare email: string;
  declare username: string;
  declare id_users: string;
  declare id_address: string;
  declare id_role: string;
  declare first_name: string;
  declare last_name: string;
  declare birth_years: number | null;
  declare country: string;
  declare jenis_kelamin: "F" | "M" | null;
  declare bio?: string;
  declare foto?: string;

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
        username: { type: DataTypes.STRING, allowNull: false, unique: true, defaultValue: "" },
        email: { type: DataTypes.STRING, allowNull: false, unique: true, defaultValue: "", },
        birth_years: { type: DataTypes.INTEGER, allowNull: true },
        country: { type: DataTypes.STRING, allowNull: false },
        jenis_kelamin: { type: DataTypes.ENUM("L", "P"), allowNull: true },
        bio: { type: DataTypes.TEXT },
        foto: { type: DataTypes.TEXT },
      },
      { sequelize, tableName: "Users" }
    );
  }
}
