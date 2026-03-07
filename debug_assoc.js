import { EmployerCandidateRel, User } from './server/models/index.js';

async function test() {
    try {
        const rel = await EmployerCandidateRel.findOne({
            include: [{ model: User, as: 'candidate' }]
        });
        console.log('REL_DATA:', JSON.stringify(rel, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

test();
