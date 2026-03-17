import { User, QuoteRequest } from './server/models/index.js';
import { Op } from 'sequelize';
import { writeFileSync } from 'fs';

async function check() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let lines = [`30 days ago: ${thirtyDaysAgo.toISOString()}`];

  const candidates = await User.findAll({ where: { role: 'candidate' } });
  for (const c of candidates) {
    const isInactive = c.lastActiveAt && new Date(c.lastActiveAt) < thirtyDaysAgo;
    const visible = !c.isHiddenByUnresponsiveness && !c.isDeactivated && !isInactive;
    lines.push(`\n${c.firstName} ${c.lastName} (${c.email})`);
    lines.push(`  isHidden=${c.isHiddenByUnresponsiveness} isDeactivated=${c.isDeactivated} lastActiveAt=${c.lastActiveAt}`);
    lines.push(`  isInactive=${isInactive} VISIBLE=${visible}`);
  }

  const quotes = await QuoteRequest.findAll({ where: { status: 'candidate_unresponsive' } });
  lines.push(`\nUnresponsive quotes: ${quotes.length}`);
  quotes.forEach(q => lines.push(`  candidateId=${q.candidateId}`));

  const output = lines.join('\n');
  writeFileSync('debug_result.txt', output, 'utf8');
  console.log('Written to debug_result.txt');
  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
