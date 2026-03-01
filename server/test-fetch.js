import axios from 'axios';

async function testFetch() {
    try {
        const res = await axios.get('http://localhost:3001/uploads/test%20with%20spaces.txt');
        console.log('Fetch success:', res.data.trim());
        process.exit(0);
    } catch (err) {
        console.error('Fetch failed:', err.message);
        process.exit(1);
    }
}

testFetch();
