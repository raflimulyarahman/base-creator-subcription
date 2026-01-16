import { Sequelize } from "sequelize";
import Address from "./address";
import Role from "./role";
import Subscribe from "./subscribe";
import User from "./user";
import ChatPersonal from "./chat";
import MessageChat from "./message";
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
Subscribe.initModel(sequelize);
ChatPersonal.initModel(sequelize);
MessageChat.initModel(sequelize);

Subscribe.belongsTo(User, { foreignKey: "id_users", as: "user" });

Address.hasMany(User, { foreignKey: "id_address" });

Role.hasMany(User, { foreignKey: "id_role" });

User.hasMany(Subscribe, { foreignKey: "id_users" });
User.belongsTo(Address, { foreignKey: "id_address", as: "address" });
User.belongsTo(Role, { foreignKey: "id_role", as: "role" });

ChatPersonal.belongsTo(User, { foreignKey: "id_users1", as: "user1" });
ChatPersonal.belongsTo(User, { foreignKey: "id_users2", as: "user2" });

MessageChat.belongsTo(ChatPersonal, {
  foreignKey: "id_personal_chat",
  as: "personal_chat",
});
MessageChat.belongsTo(User, { foreignKey: "id_users", as: "user" });

// Setelah ChatPersonal.initModel(sequelize);
ChatPersonal.hasMany(MessageChat, {
  foreignKey: "id_personal_chat",
  as: "messages", // alias ini harus sama dengan yang di include
});

const db = {
  sequelize,
  Sequelize,
  User,
  Address,
  Role,
  Subscribe,
  ChatPersonal,
  MessageChat,
};

export default db;
