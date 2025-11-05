import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize, schema: string) => {
  class Slider extends Model { }

  Slider.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      images: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: false,
        defaultValue: 'N',
      },
      created: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'cms_sliders',
      modelName: 'Slider',
      schema,
      timestamps: true, // manages createdAt & updatedAt
    }
  );
  return Slider;
};
