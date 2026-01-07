import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface PhotoAttributes {
  id_fhotos: string;
  id_address: string;
  foto: string;
}

export interface PhotoCreationAttributes extends Optional<PhotoAttributes, "id_fhotos"> {}

export default class Photo extends Model<PhotoAttributes, PhotoCreationAttributes> implements PhotoAttributes {
  declare id_fhotos: string;
  declare id_address: string;
  declare foto: string;

  static initModel(sequelize: Sequelize) {
    Photo.init(
      {
        id_fhotos: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        id_address: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        foto: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Photo",
        tableName: "Photos",
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    Photo.belongsTo(models.Address, { foreignKey: "id_address" });
  }
}
