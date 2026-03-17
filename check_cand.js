import { User } from './server/models/index.js';
import { Op } from 'sequelize';

async function checkCandidates() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  console.log("30 days ago:", thirtyDaysAgo);
  
  const allCandidates = await User.findAll({ where: { role: 'candidate' } });
  console.log("Total candidates:", allCandidates.length);
  
  for(let c of allCandidates) {
    console.log(`ID: ${c.id}, email: ${c.email}, isDeactivated: ${c.isDeactivated}, isHidden: ${c.isHiddenByUnresponsiveness}, lastActiveAt: ${c.lastActiveAt}`);
  }

  const filtered = await User.findAll({
    where: {
      role: 'candidate',
      isDeactivated: false,
      isHiddenByUnresponsiveness: false,
      lastActiveAt: { [Op.gt]: thirtyDaysAgo }
    }
  });
  console.log("\nFiltered candidates Count:", filtered.length);
  process.exit(0);
}

checkCandidates();
