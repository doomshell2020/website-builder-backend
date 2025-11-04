"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class User extends sequelize_1.Model {
    }
    User.init({
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        role_id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        mobile: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        landmark: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        dob: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: sequelize_1.DataTypes.ENUM('male', 'female', 'other'),
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
        },
        categories: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        profile: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: 'users',
        modelName: 'User',
    });
    return User;
};
