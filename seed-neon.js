import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProcess = spawn('node', ['server/seed.js'], {
    env: {
        ...process.env,
        DATABASE_URL: 'postgresql://neondb_owner:npg_hW4tycedL3uO@ep-odd-pine-alz7gt37-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
    },
    stdio: 'inherit'
});

seedProcess.on('close', (code) => {
    console.log(`Seed process exited with code ${code}`);
});
