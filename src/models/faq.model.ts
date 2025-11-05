import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize, schema: string) => {
  class Faq extends Model {
    static associate(db: any) {
      Faq.belongsTo(db.FAQCategory, { foreignKey: "category_id", as: "category" });
    }
  }

  Faq.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      category_id: {
        type: DataTypes.INTEGER,
        references: { model: "cms_faq_categories", key: "id" },
        allowNull: true,
        onDelete: "SET NULL",
      },
      question: { type: DataTypes.TEXT, allowNull: false },
      answer: { type: DataTypes.TEXT, allowNull: false },
      slug: { type: DataTypes.TEXT, unique: true },
      status: { type: DataTypes.ENUM("Y", "N"), defaultValue: "Y" },
      deleted: { type: DataTypes.ENUM("Y", "N"), defaultValue: "N" },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: "cms_faqs",
      schema,
      modelName: "Faq",
    }
  );

  return Faq;
};