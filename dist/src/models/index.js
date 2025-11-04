"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelizeInstance = void 0;
const sequelize_1 = require("sequelize");
const glob_1 = __importDefault(require("glob")); // Used to find all model files
const path_1 = __importDefault(require("path"));
const database_config_1 = __importDefault(require("../../config/database.config")); // Import initialized Sequelize instance
// Define the database object to hold all models
const db = {};
// Get the current models directory path
const modelsPath = path_1.default.join(__dirname);
// Find all model files recursively ending with .model.ts
const modelFiles = glob_1.default.sync(path_1.default.join(modelsPath, '**/*.model.ts'));
// Loop through and register each model
for (const file of modelFiles) {
    const modelModule = require(file); // Dynamically import model file
    const modelFactory = modelModule.default || modelModule; // Get the model factory function
    const model = modelFactory(database_config_1.default, sequelize_1.DataTypes); // Initialize model with Sequelize instance and DataTypes
    db[model.name] = model; // Add model to db object
}
// Setup model associations if defined
Object.values(db).forEach((model) => {
    if (typeof model.associate === 'function') {
        model.associate(db); // Call associate method to link models
    }
});
// Export Sequelize instance and all models
exports.sequelizeInstance = database_config_1.default;
exports.default = db;
