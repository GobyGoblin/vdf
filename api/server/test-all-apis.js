import axios from 'axios';

const baseURL = 'http://localhost:3001/api';
let tokens = {};
let userIds = {};

async function testApi() {
    console.log('--- Starting API Tests ---');
    let passed = 0;
    let failed = 0;

    async function request(name, method, url, data = null, role = null) {
        try {
            const config = {
                method,
                url: `${baseURL}${url}`,
                headers: role && tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {},
            };
            if (data) config.data = data;

            const res = await axios(config);
            console.log(`✅ [${name}] Success (${res.status})`);
            passed++;
            return res.data;
        } catch (err) {
            console.log(`❌ [${name}] Failed: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
            failed++;
            return null;
        }
    }

    // 1. Authenticate users
    console.log('\n--- 1. Authentication ---');

    const adminLogin = await request('Login Admin', 'POST', '/auth/login', { email: 'admin@example.com', password: 'password123' });
    if (adminLogin) { tokens.admin = adminLogin.token; userIds.admin = adminLogin.user.id; }

    const staffLogin = await request('Login Staff', 'POST', '/auth/login', { email: 'staff@example.com', password: 'password123' });
    if (staffLogin) { tokens.staff = staffLogin.token; }

    const employerLogin = await request('Login Employer', 'POST', '/auth/login', { email: 'employer1@example.com', password: 'password123' });
    if (employerLogin) { tokens.employer = employerLogin.token; userIds.employer = employerLogin.user.id; }

    const candidateLogin = await request('Login Candidate', 'POST', '/auth/login', { email: 'candidate1@example.com', password: 'password123' });
    if (candidateLogin) { tokens.candidate = candidateLogin.token; userIds.candidate = candidateLogin.user.id; }

    // 2. Dashboards (Test the newly added stats logic)
    console.log('\n--- 2. Dashboard Stats ---');
    await request('Candidate Dashboard Stats', 'GET', '/profiles/dashboard/stats', null, 'candidate');
    await request('Employer Dashboard Stats', 'GET', '/profiles/dashboard/stats', null, 'employer');
    await request('Admin Dashboard Stats', 'GET', '/admin/stats', null, 'admin');
    await request('Staff Dashboard Stats', 'GET', '/staff/stats', null, 'staff');

    // 3. Profiles
    console.log('\n--- 3. Profiles ---');
    await request('Get Candidate Profile', 'GET', `/profiles/candidate/${userIds.candidate}`, null, 'candidate');
    await request('Get Employer Profile', 'GET', `/profiles/employer/${userIds.employer}`, null, 'employer');



    // 5. Staff & Admin Routes
    console.log('\n--- 5. Staff & Admin Routes ---');
    await request('Get Pending Companies', 'GET', '/staff/pending-companies', null, 'staff');
    await request('Get Pending Reviews', 'GET', '/staff/pending-reviews', null, 'staff');
    await request('Get Pipeline Relations', 'GET', '/staff/relations', null, 'staff');
    await request('Get All Employers', 'GET', '/admin/employers', null, 'admin');
    await request('Get All Workers', 'GET', '/admin/workers', null, 'admin');

    // 6. Insights
    console.log('\n--- 6. Insights ---');
    await request('Get Global Insights', 'GET', '/insights');

    console.log(`\n--- Test Summary ---`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
}

testApi();
