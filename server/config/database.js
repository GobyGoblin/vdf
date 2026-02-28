import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (dbUrl) {
  // Use PostgreSQL if DATABASE_URL or POSTGRES_URL is provided (ideal for Vercel/Production)
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for many hosted DBs like Neon/Supabase
      }
    }
  });
  console.log('📡 Database: Initializing PostgreSQL connection...');
} else {
  // Fallback to SQLite (local development / troubleshooting)
  const storagePath = process.env.VERCEL
    ? '/tmp/database.sqlite'
    : path.join(__dirname, '../database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: storagePath,
    logging: false,
  });
  console.log('📂 Database: Initializing local SQLite (path: ' + storagePath + ')');
}

export default sequelize;
