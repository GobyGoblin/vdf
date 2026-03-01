import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (dbUrl) {
  // Use PostgreSQL if DATABASE_URL or POSTGRES_URL is provided
  // We specify the 'pg' library as the dialect module to ensure it's loaded correctly on Vercel
  // We import it dynamically if we can just to be extra safe
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: await import('pg').then(m => m.default || m),
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
  console.log('📡 Database: Initializing PostgreSQL connection...');
} else {
  // Fallback to SQLite (Local Dev Only)
  // Vercel will ignore this branch because POSTGRES_URL is defined
  const storagePath = path.join(__dirname, '../database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    dialectModule: await import('sqlite3').then(m => m.default || m),
    storage: storagePath,
    logging: true,
  });
  console.log('📂 Database: Initializing local SQLite (path: ' + storagePath + ')');
}

export default sequelize;
