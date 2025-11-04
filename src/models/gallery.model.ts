import { DataTypes, Model, Sequelize } from 'sequelize';

export default (sequelize: Sequelize, schema: string) => {
    class Gallery extends Model { }

    Gallery.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            slug: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            images: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'N',
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
            tableName: 'cms_gallery',
            modelName: 'Gallery',
            schema,
            timestamps: true,
        }
    );
    return Gallery;
};
