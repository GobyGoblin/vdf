import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Static imports so Vercel's NFT bundler includes them
import 'sqlite3';
import 'pg';
import 'pg-hstore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

if (process.env.DATABASE_URL) {
  // Production: use PostgreSQL (Neon)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    logging: false,
  });
} else {
  // Local dev: use SQLite
  const storagePath = path.join(__dirname, '../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

export default sequelize;
