import { User, QuoteRequest } from './server/models/index.js';
import { Op } from 'sequelize';

async function check() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  console.log('30 days ago:', thirtyDaysAgo.toISOString());

  const candidates = await User.findAll({ where: { role: 'candidate' } });
  for (const c of candidates) {
    const isInactive = c.lastActiveAt && new Date(c.lastActiveAt) < thirtyDaysAgo;
    const visible = !c.isHiddenByUnresponsiveness && !c.isDeactivated && !isInactive;
    console.log(`\n${c.firstName} ${c.lastName}`);
    console.log(`  isHidden: ${c.isHiddenByUnresponsiveness}, isDeactivated: ${c.isDeactivated}, lastActiveAt: ${c.lastActiveAt}`);
    console.log(`  isInactive(30d): ${isInactive}, VISIBLE: ${visible}`);
  }

  const quotes = await QuoteRequest.findAll();
  const unresponsive = quotes.filter(q => q.status === 'candidate_unresponsive');
  console.log(`\nQuotes with candidate_unresponsive: ${unresponsive.length}`);
  unresponsive.forEach(q => console.log(`  candidateId: ${q.candidateId}`));

  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
