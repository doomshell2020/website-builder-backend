import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize, schema: string) => {
  class ClientLogo extends Model { }

  ClientLogo.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: 'Y',
        validate: {
          isIn: [['Y', 'N']],
        },
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'cms_banners',
      modelName: 'ClientLogo',
      schema,
      timestamps: false,
    }
  );
  return ClientLogo;
};
