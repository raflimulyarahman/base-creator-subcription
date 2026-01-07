import { Sequelize } from "sequelize";
import Address from "./address";

import Role from "./role";
import User from "./user";

import configFile from "../../config/config.json";
const env = process.env.NODE_ENV || "development";
const config: any = (configFile as any)[env];

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable] as string,
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

User.initModel(sequelize);
Address.initModel(sequelize);
Role.initModel(sequelize);

Address.hasMany(User, { foreignKey: "id_address" });

Role.hasMany(User, { foreignKey: "id_role" });

User.belongsTo(Address, { foreignKey: "id_address", as: "address" });
User.belongsTo(Role, { foreignKey: "id_role", as: "role" });

const db = {
  sequelize,
  Sequelize,
  User,
  Address,
  Role,
};

export default db;
