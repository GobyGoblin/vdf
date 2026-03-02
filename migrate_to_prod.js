/**
 * Migrate local users to production backend
 * Usage: node migrate_to_prod.js
 */
import fetch from 'node-fetch';

const PROD_API = 'https://vdf-111l.vercel.app/api';
const ADMIN_EMAIL = 'elmehdielhammouti@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || '';

if (!ADMIN_PASS) {
    console.error('Set ADMIN_PASS env var: $env:ADMIN_PASS="yourpassword"; node migrate_to_prod.js');
    process.exit(1);
}

// Local users to migrate (passwords are hashed so we need to create them with
// a temporary password — you can then reset via admin panel)
const usersToMigrate = [
    {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isVerified: true,
    },
    {
        email: 'abdelelmoghit@vdf.com',
        password: 'password123',
        role: 'candidate',
        firstName: 'Abed El Moghit',
        lastName: 'el Qadi',
        isVerified: true,
    },
    {
        email: 'abdelmoghit@vdf.com',
        password: 'password123',
        role: 'staff',
        firstName: 'Abed el Moghit',
        lastName: 'el Qadi',
        isVerified: true,
    },
    {
        email: 'julia@vdf.com',
        password: 'password123',
        role: 'employer',
        firstName: 'Julia',
        lastName: 'Maurice',
        companyName: 'VDF GMBH',
        isVerified: true,
    },
];

async function migrate() {
    // 1. Login as admin on prod
    console.log('Logging in to prod as admin...');
    const loginRes = await fetch(`${PROD_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'admin' }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.error('Login failed:', loginData);
        process.exit(1);
    }
    const token = loginData.token;
    console.log('✅ Logged in to prod');

    // 2. Get existing users on prod
    const existingRes = await fetch(`${PROD_API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const existingData = await existingRes.json();
    const existingEmails = new Set((existingData.users || existingData).map(u => u.email));
    console.log(`Prod has ${existingEmails.size} existing users:`, [...existingEmails]);

    // 3. Create missing users
    for (const user of usersToMigrate) {
        if (existingEmails.has(user.email)) {
            console.log(`⏭️  Skipping (already exists): ${user.email}`);
            continue;
        }

        const createRes = await fetch(`${PROD_API}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(user),
        });
        const createData = await createRes.json();
        if (createRes.ok) {
            console.log(`✅ Created: ${user.email} (${user.role})`);

            // If employer, verify them
            if (user.isVerified && (user.role === 'employer' || user.role === 'candidate')) {
                const userId = createData.user?.id || createData.id;
                const endpoint = user.role === 'employer'
                    ? `${PROD_API}/admin/employers/${userId}/verify`
                    : `${PROD_API}/admin/workers/${userId}/verify`;
                await fetch(endpoint, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isVerified: true }),
                });
                console.log(`  ✅ Verified: ${user.email}`);
            }
        } else {
            console.error(`❌ Failed to create ${user.email}:`, createData);
        }
    }

    console.log('\n✅ Migration complete!');
}

migrate().catch(console.error);
