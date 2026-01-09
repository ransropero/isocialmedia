const axios = require('axios');

async function testAuth() {
    const API_URL = 'http://localhost:5001/api/auth';
    const TEST_EMAIL = `test_${Date.now()}@example.com`;
    const TEST_PASSWORD = 'password123';

    console.log('Testing Auth API...');

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${TEST_EMAIL}`);
        try {
            const registerRes = await axios.post(`${API_URL}/register`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            console.log('✅ Register success:', registerRes.data.email);
        } catch (err) {
            console.error('❌ Register failed:', err.response ? err.response.data : err.message);
            // If fail, maybe duplicate, try login
        }

        // 2. Login
        console.log(`\n2. Logging in user: ${TEST_EMAIL}`);
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        console.log('✅ Login success. Token:', loginRes.data.token ? 'Received' : 'Missing');

        // 3. Login with wrong password
        console.log('\n3. Testing invalid login...');
        try {
            await axios.post(`${API_URL}/login`, {
                email: TEST_EMAIL,
                password: 'wrongpassword'
            });
            console.error('❌ Invalid login SHOULD have failed but succeeded.');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('✅ Invalid login failed as expected (401).');
            } else {
                console.error('❌ Invalid login failed with unexpected error:', err.message);
            }
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

testAuth();
