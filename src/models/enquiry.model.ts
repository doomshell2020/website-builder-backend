import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize, schema: string) => {
  class Enquiry extends Model { }
  Enquiry.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING(20),
      },
      subject: {
        type: DataTypes.TEXT,
      },
      country: {
        type: DataTypes.STRING(50),
      },
      status: {
        type: DataTypes.CHAR(1),
        defaultValue: 'Y',
        validate: {
          isIn: [['Y', 'N']],
        },
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
      tableName: 'cms_enquiry',
      modelName: 'Enquiry',
      schema,
      timestamps: true,
    }
  );
  return Enquiry;
};
