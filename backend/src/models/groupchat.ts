// src/models/groupChat.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import MessageGroupChat from "./messgroup"; // Import the MessageChat model
import User from "./user"; // Import the User model

export interface GroupChatAttributes {
  id_group_chat: string;
  id_users: string;
  name_group: string;
  foto_group: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupChatCreationAttributes extends Optional<
  GroupChatAttributes,
  "id_group_chat"
> {}

export default class GroupChat
  extends Model<GroupChatAttributes, GroupChatCreationAttributes>
  implements GroupChatAttributes
{
  declare id_group_chat: string;
  declare id_users: string;
  declare name_group: string;
  declare foto_group: string | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;

  // Initialize the model
  static initModel(sequelize: Sequelize) {
    GroupChat.init(
      {
        id_group_chat: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_users: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        name_group: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        foto_group: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "GroupChat", // Corrected model name to "GroupChat"
        tableName: "GroupChats", // Corrected table name to "GroupChats"
        timestamps: true, // Enable timestamps for createdAt and updatedAt
      },
    );
  }

  // Define model associations (many-to-many relationships with User and MemberGroupChat)
  static associate(models: any) {
    // Define relationship with MemberGroupChat (join table for group chat members)
    GroupChat.hasMany(models.MemberGroupChat, {
      foreignKey: "id_group_chat",
      as: "members",
    });

    // Define relationship with MessageGroupChat (messages in the group)
    GroupChat.hasMany(MessageGroupChat, {
      foreignKey: "id_group_chat",
      as: "messages",
    });

    // Define relationship with User (creator of the group)
    GroupChat.belongsTo(User, {
      foreignKey: "id_users",
      as: "creator",
    });
  }
}
