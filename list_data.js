import { QuoteRequest, User } from './server/models/index.js';

async function list() {
  try {
    const employers = await User.findAll({ where: { role: 'employer' }, limit: 1 });
    const candidates = await User.findAll({ where: { role: 'candidate' }, limit: 5 });

    console.log('--- Employers ---');
    employers.forEach(u => console.log(`${u.id}: ${u.email}`));
    console.log('--- Candidates ---');
    candidates.forEach(u => console.log(`${u.id}: ${u.email} (${u.firstName} ${u.lastName})`));

    const requests = await QuoteRequest.findAll({ limit: 5 });
    console.log('--- Recent Requests ---');
    requests.forEach(r => console.log(`${r.id}: Emp ${r.employerId} -> Cand ${r.candidateId} (Status: ${r.status})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

list();
