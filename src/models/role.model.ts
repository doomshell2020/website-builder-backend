import { Sequelize, DataTypes, Model } from 'sequelize';

export default (sequelize: Sequelize) => {
    class Role extends Model { }

    Role.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'Y',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        },
        {
            sequelize,
            tableName: 'cms_role',
            modelName: 'Role',
        }
    );

    return Role;
};