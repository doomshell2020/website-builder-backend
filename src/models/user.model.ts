import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class User extends Model {
    static associate(db: any) {
      User.belongsTo(db.Role, {
        foreignKey: 'role',
        as: 'roleData',
      });

      User.belongsTo(db.Theme, {
        foreignKey: 'website_type',
        as: 'Theme',
      });

      User.hasMany(db.Subscription, {
        foreignKey: 'c_id',
        as: 'subscriptionData',
      });
    }
  }

  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      mobile_no: { type: DataTypes.STRING(250), allowNull: false },
      office_no: { type: DataTypes.STRING(250), allowNull: true },
      fax_no: { type: DataTypes.STRING(250), allowNull: true },
      company_name: { type: DataTypes.STRING(255), allowNull: false },
      custom_domain: { type: DataTypes.STRING(50), allowNull: true },
      schema_name: { type: DataTypes.STRING(50), allowNull: false },
      subdomain: { type: DataTypes.STRING(100), allowNull: false },
      role: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2, references: { model: "cms_role", key: "id" } },
      website_type: { type: DataTypes.INTEGER, allowNull: false, references: { model: "website_type", key: "id" } },
      fburl: { type: DataTypes.STRING(250), allowNull: true },
      xurl: { type: DataTypes.STRING(250), allowNull: true },
      linkedinurl: { type: DataTypes.STRING(250), allowNull: true },
      yturl: { type: DataTypes.STRING(250), allowNull: true },
      instaurl: { type: DataTypes.STRING(250), allowNull: true },
      country: { type: DataTypes.STRING(100), allowNull: true },
      gstin: { type: DataTypes.STRING(100), allowNull: true },
      imageFolder: { type: DataTypes.STRING(255), allowNull: true },
      address1: { type: DataTypes.STRING(255), allowNull: true },
      address2: { type: DataTypes.STRING(255), allowNull: true },
      image: { type: DataTypes.TEXT, allowNull: true },
      company_logo: { type: DataTypes.TEXT, allowNull: false },
      favicon: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
      gst_type: { type: DataTypes.ENUM("IGST", "CGST_SGST"), allowNull: false, defaultValue: "CGST_SGST" },
      approval: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: 'N' },
      deleted: { type: DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "N" },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: "cms_users",
      modelName: 'User',
      schema: "public",
      timestamps: true,
      underscored: false,
    }
  );

  return User;
};