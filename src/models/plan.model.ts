import { Sequelize, DataTypes, Model } from "sequelize";

export default (sequelize: Sequelize) => {

    class Plan extends Model { }

    Plan.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            price: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("Y", "N"),
                allowNull: false,
                defaultValue: "Y",
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "plans",
            modelName: 'Plan',
            schema: "public",
            timestamps: true,
        }
    );

    return Plan;
}