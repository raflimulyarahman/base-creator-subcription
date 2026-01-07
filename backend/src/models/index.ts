import { Sequelize } from "sequelize";
import Address from "./address";
import Photo from "./photo";

import Role from "./role";
import User from "./user";
import UserAnswer from "./useranswer";

import configFile from "../../config/config.json";
const env = process.env.NODE_ENV || "development";
const config: any = (configFile as any)[env];

  let sequelize: Sequelize;
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }

User.initModel(sequelize);
Address.initModel(sequelize);
Role.initModel(sequelize);
Photo.initModel(sequelize);
UserAnswer.initModel(sequelize);


Address.hasMany(User, { foreignKey: "id_address" });
Address.hasMany(Photo, { foreignKey: "id_address" });

Role.hasMany(User, { foreignKey: "id_role" });

User.hasMany(UserAnswer, { foreignKey: "id_user" });
UserAnswer.belongsTo(User, { foreignKey: "id_user" });

User.belongsTo(Address, { foreignKey: "id_address", as: "address" });
User.belongsTo(Role, { foreignKey: "id_role", as: "role" });


Photo.belongsTo(Address, { foreignKey: "id_address" });


const db = {
  sequelize,
  Sequelize,
  User,
  Address,
  Role,
  Photo,
  UserAnswer
};

export default db;
