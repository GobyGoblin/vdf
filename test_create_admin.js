import axios from 'axios';

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;

        const res = await axios.post('http://localhost:3001/api/admin/users', {
            email: 'staff2@example.com',
            password: 'password123',
            role: 'staff',
            firstName: 'Staff',
            lastName: 'Two',
            companyName: ''
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", res.data);
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
