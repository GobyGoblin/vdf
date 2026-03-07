import sequelize from './server/config/database.js';
import { User, QuoteRequest } from './server/models/index.js';

async function seedHired() {
    try {
        console.log('Synchronizing database to apply QuoteRequest model updates...');
        await sequelize.sync();

        console.log('Looking up users...');
        const emp = await User.findOne({ where: { email: 'employer1@example.com' } });
        const cand = await User.findOne({ where: { email: 'candidate2@example.com' } });

        if (!emp || !cand) {
            console.error('Employer or candidate not found! Make sure you ran the main seed first.');
            process.exit(1);
        }

        console.log('Inserting mock Hired/Paid QuoteRequest...');

        // Remove existing paid quotes for this candidate to avoid duplicates
        await QuoteRequest.destroy({
            where: {
                employerId: emp.id,
                candidateId: cand.id,
                status: 'paid'
            }
        });

        const qr = await QuoteRequest.create({
            employerId: emp.id,
            candidateId: cand.id,
            status: 'paid',
            requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
            hiringProcess: {
                currentStep: 'visa_application',
                updatedAt: new Date().toISOString(),
                steps: [
                    { name: 'contract', status: 'done', notes: 'Signed 2-year permanent employment agreement with 6 months probation.', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
                    { name: 'visa_application', status: 'in_progress', notes: 'Fast-track visa application submitted to the local embassy. Biometrics appointment scheduled for next week.', updatedAt: new Date().toISOString() },
                    { name: 'work_permit', status: 'pending' },
                    { name: 'relocation', status: 'pending' },
                    { name: 'onboarding', status: 'pending' }
                ]
            }
        });

        console.log('Mock Hired Profile Tracking Created Successfully! ID: ' + qr.id);
        console.log('You can now log in as employer1@example.com and check the "Hired Talents" and tracking features.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

seedHired();
