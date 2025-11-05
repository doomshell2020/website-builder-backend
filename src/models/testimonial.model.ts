import { Sequelize, DataTypes, Model } from 'sequelize';

export default (sequelize: Sequelize, schema: string) => {
  class Testimonials extends Model { }

  Testimonials.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      company_logo: DataTypes.TEXT,
      cat_id: DataTypes.INTEGER,
      subcat_id: DataTypes.INTEGER,
      desig: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: DataTypes.TEXT,
      image: DataTypes.TEXT,
      url: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: false,
        defaultValue: 'Y',
      },
    },
    {
      sequelize,
      tableName: 'cms_testimonials',
      modelName: 'Testimonials',
      schema,
    }
  );

  return Testimonials;
};
