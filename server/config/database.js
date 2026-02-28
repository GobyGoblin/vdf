import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import sqlite3 from 'sqlite3';

const storagePath = process.env.VERCEL
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: sqlite3,
  storage: storagePath,
  logging: false,
});

export default sequelize;
