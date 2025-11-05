import { Model, DataTypes, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {

    class Theme extends Model { }

    Theme.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            slug: {
                type: DataTypes.TEXT,
                unique: true,
            },
            description: {
                type: DataTypes.TEXT,
            },
            status: {
                type: DataTypes.ENUM("Y", "N"),
                defaultValue: "Y",
            },
        },
        {
            sequelize,
            tableName: "theme_store",
            modelName: "Theme",
            schema: "public",
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );
    return Theme;
};
