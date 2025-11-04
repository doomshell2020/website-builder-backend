"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class User extends sequelize_1.Model {
        static associate(db) {
            User.belongsTo(db.Role, {
                foreignKey: 'role',
                as: 'roleData',
            });
            User.belongsTo(db.Theme, {
                foreignKey: 'website_type',
                as: 'Theme',
            });
        }
    }
    User.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: sequelize_1.DataTypes.STRING(200), allowNull: false },
        email: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true },
        password: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
        mobile_no: { type: sequelize_1.DataTypes.STRING(250), allowNull: false },
        office_no: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
        fax_no: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
        company_name: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
        role: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 3, references: { model: "cms_role", key: "id" } },
        website_type: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: "website_type", key: "id" } },
        fburl: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
        xurl: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
        linkedinurl: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
        yturl: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
        instaurl: { type: sequelize_1.DataTypes.STRING(250), allowNull: true },
        country: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
        gstin: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
        address1: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
        address2: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
        image: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
        company_logo: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
        status: { type: sequelize_1.DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "Y" },
        approval: { type: sequelize_1.DataTypes.CHAR(1), allowNull: false, defaultValue: 'N' },
        deleted: { type: sequelize_1.DataTypes.ENUM("Y", "N"), allowNull: false, defaultValue: "N" },
        createdAt: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
        updatedAt: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
    }, {
        sequelize,
        tableName: "cms_users",
        modelName: 'User',
        schema: "public",
        timestamps: true,
        underscored: false,
    });
    return User;
};
//# sourceMappingURL=user.model.js.map