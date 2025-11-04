"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize_1 = require("sequelize");
// Initialize Sequelize with PostgreSQL connection using environment variables
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
        } : false,
    },
});
// Test and verify the database connection
sequelize.authenticate()
    .then(() => {
    console.log(' Connected to Supabase PostgreSQL successfully.');
})
    .catch((err) => {
    console.error(' Failed to connect to Supabase PostgreSQL:', err.message);
});
exports.default = sequelize;
