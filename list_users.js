import { User } from './server/models/index.js';

async function listUsers() {
  const users = await User.findAll();
  users.forEach(u => console.log(`${u.role}: ${u.email}`));
  process.exit(0);
}

listUsers();
