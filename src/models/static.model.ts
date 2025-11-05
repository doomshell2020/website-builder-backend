import { Sequelize, DataTypes, Model } from 'sequelize';

export default (sequelize: Sequelize, schema: string) => {
  class Static extends Model { }
  Static.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
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
    },
    {
      sequelize,
      tableName: 'cms_statics',
      modelName: 'Static',
      schema,
    }
  );
  return Static;
};
