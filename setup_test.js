import { QuoteRequest, User } from './server/models/index.js';

async function setupTest() {
  try {
    const employer = await User.findOne({ where: { role: 'employer' } });
    const candidates = await User.findAll({ where: { role: 'candidate' } });

    if (!employer || candidates.length < 2) {
      console.log('Missing users. Emp:', !!employer, 'Cands:', candidates.length);
      process.exit(1);
    }

    const c1 = candidates[0];
    const c2 = candidates[1];

    // Create a request that is "candidate_unresponsive" and has an alternative
    const reqId = 'test-recruited-elsewhere-' + Date.now();
    const req = await QuoteRequest.create({
      id: reqId,
      employerId: employer.id,
      candidateId: c1.id,
      altCandidateId: c2.id,
      status: 'candidate_unresponsive',
      requestedAt: new Date(),
      unresponsiveAt: new Date(),
      options: [
        {
          id: 'opt-1',
          name: 'Essential Package',
          costEstimate: '€9,500 - €11,000',
          perks: ['Standard Placement', 'Basic Support'],
          items: [
            { label: 'Placement Fee', amount: 8000, description: 'Recruitment' },
            { label: 'Admin Fee', amount: 1500, description: 'Processing' }
          ]
        },
        {
          id: 'opt-2',
          name: 'Elite Package',
          costEstimate: '€14,000 - €16,000',
          perks: ['Priority Support', 'Relocation assistance'],
          items: [
            { label: 'Placement Fee', amount: 10000, description: 'Executive Search' },
            { label: 'Relocation', amount: 6000, description: 'Full Support' }
          ]
        }
      ]
    });

    console.log('Test request created:', req.id);
    console.log('Employer:', employer.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setupTest();
