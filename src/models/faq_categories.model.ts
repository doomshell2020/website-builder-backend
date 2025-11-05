import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize, schema: string) => {
  class FAQCategory extends Model {
    static associate(db: any) {
      FAQCategory.hasMany(db.Faq, { foreignKey: "category_id", as: "faqs" });
    }
  }

  FAQCategory.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      slug: { type: DataTypes.TEXT, unique: true },
      description: { type: DataTypes.TEXT },
      status: { type: DataTypes.ENUM("Y", "N"), defaultValue: "Y" },
      deleted: { type: DataTypes.ENUM("Y", "N"), defaultValue: "N" },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: "cms_faq_categories",
      schema,
      modelName: "FAQCategory",
    }
  );

  return FAQCategory;
};