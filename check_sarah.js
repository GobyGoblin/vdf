import { User, QuoteRequest } from './server/models/index.js';
import { Op } from 'sequelize';

async function check() {
  const candidates = await User.findAll({ where: { role: 'candidate' } });
  console.log('\n=== All Candidates ===');
  for (let c of candidates) {
    console.log(`${c.firstName} ${c.lastName} (id ends: ...${String(c.id).slice(-4)})`);
    console.log(`  isHiddenByUnresponsiveness: ${c.isHiddenByUnresponsiveness}`);
    console.log(`  isDeactivated: ${c.isDeactivated}`);
    console.log(`  lastActiveAt: ${c.lastActiveAt}`);
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const visible = await User.findAll({
    where: {
      role: 'candidate',
      isDeactivated: false,
      isHiddenByUnresponsiveness: false,
      lastActiveAt: { [Op.gt]: thirtyDaysAgo }
    }
  });
  console.log(`\n=== Visible in talent pool: ${visible.length} candidates ===`);
  visible.forEach(c => console.log(`  ${c.firstName} ${c.lastName}`));

  const quotes = await QuoteRequest.findAll();
  console.log('\n=== Quotes with candidate_unresponsive ===');
  quotes.filter(q => q.status === 'candidate_unresponsive').forEach(q => {
    console.log(`  QuoteId: ${q.id}, candidateId: ${q.candidateId}, altCandidateId: ${q.altCandidateId}`);
  });

  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
