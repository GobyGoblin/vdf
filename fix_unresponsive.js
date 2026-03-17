/**
 * One-time migration: sync isHiddenByUnresponsiveness flag for any candidates
 * whose existing quotes have candidate_unresponsive status.
 * Safe to run multiple times.
 */
import { User, QuoteRequest } from './server/models/index.js';

async function syncUnresponsiveFlags() {
  console.log('Syncing unresponsive candidate flags from existing quotes...');

  const unresponsiveQuotes = await QuoteRequest.findAll({
    where: { status: 'candidate_unresponsive' }
  });

  let fixed = 0;
  for (const quote of unresponsiveQuotes) {
    const candidate = await User.findByPk(quote.candidateId);
    if (candidate && !candidate.isHiddenByUnresponsiveness) {
      await candidate.update({
        isHiddenByUnresponsiveness: true,
        isDeactivated: true,
      });
      console.log(`  Fixed: ${candidate.firstName} ${candidate.lastName} (${candidate.email})`);
      fixed++;
    }
  }

  console.log(`Done. Fixed ${fixed} candidate(s).`);
  process.exit(0);
}

syncUnresponsiveFlags().catch(e => { console.error(e); process.exit(1); });
