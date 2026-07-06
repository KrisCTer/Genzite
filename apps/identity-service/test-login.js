const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@genzite.com',
      password: 'admin@genzite.com'
    });
    console.log('Login Success:', res.data);
  } catch (err) {
    console.error('Login Failed:', err.response ? err.response.data : err.message);
  }
}
testLogin();
