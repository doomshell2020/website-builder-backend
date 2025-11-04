import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';
// Initialize Sequelize with PostgreSQL connection using environment variables

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl:
        process.env.DB_SSL === 'true'
          ? {
            require: true,
            rejectUnauthorized: false,
          }
          : false,
    },
  }
);
// Test and verify the database connection

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connected to Supabase PostgreSQL successfully.');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to Supabase PostgreSQL:', err.message);
  });

export default sequelize;
