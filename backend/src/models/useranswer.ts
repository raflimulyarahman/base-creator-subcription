import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface UserAnswerAttributes {
  id_user_answer: string;
  id_user: string;
  id_question: string;
  selected_option: string;
}

export interface UserAnswerCreationAttributes extends Optional<UserAnswerAttributes, "id_user_answer"> {}

export default class UserAnswer extends Model<UserAnswerAttributes, UserAnswerCreationAttributes>
  implements UserAnswerAttributes {
  declare id_user_answer: string;
  declare id_user: string;
  declare id_question: string;
  declare selected_option: string;

  static initModel(sequelize: Sequelize) {
    UserAnswer.init(
      {
        id_user_answer: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        id_user: { type: DataTypes.UUID, allowNull: false },
        id_question: { type: DataTypes.UUID, allowNull: false },
        selected_option: { type: DataTypes.STRING, allowNull: false }
      },
      {
        sequelize,
        tableName: "UserAnswers",
        modelName: "UserAnswer",
        timestamps: true
      }
    );
  }

  static associate(models: any) {
    UserAnswer.belongsTo(models.User, { foreignKey: "id_user" });
    UserAnswer.belongsTo(models.Question, { foreignKey: "id_question" });
  }
}
