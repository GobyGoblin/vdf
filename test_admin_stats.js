import axios from 'axios';

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@gbp-portal.de',
            password: 'password123'
        });
        const token = loginRes.data.token;

        const res = await axios.get('http://localhost:3001/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Stats Success:", JSON.stringify(res.data));
    } catch (err) {
        if (err.response) {
            console.error("Error status:", err.response.status);
            console.error("Error data:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}
test();
