import axios from 'axios';

const BACKEND_URL = 'https://rapid-mixer-2-0-1.onrender.com';

console.log('🧪 Quick Backend Test');
console.log('====================');

async function quickTest() {
    try {
        console.log('Testing health endpoint...');
        const health = await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Health:', health.data.status);
        
        console.log('\nTesting auth registration...');
        try {
            const register = await axios.post(`${BACKEND_URL}/api/auth/register`, {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            });
            console.log('✅ Registration endpoint working');
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('✅ Registration endpoint working (user exists)');
            } else {
                console.log('❌ Registration error:', error.response?.data?.error || error.message);
            }
        }
        
        console.log('\nTesting subscription plans...');
        try {
            const plans = await axios.get(`${BACKEND_URL}/api/subscription/plans`);
            console.log('✅ Subscription plans:', plans.data.plans?.length || 0, 'plans');
        } catch (error) {
            console.log('❌ Subscription plans error:', error.response?.data?.error || error.message);
        }
        
        console.log('\n🎉 Backend is ready for premium features!');
        
    } catch (error) {
        console.log('❌ Backend test failed:', error.message);
        console.log('\n📝 Action needed:');
        console.log('1. Check if backend is deployed');
        console.log('2. Verify environment variables');
        console.log('3. Check Render service logs');
    }
}

quickTest();