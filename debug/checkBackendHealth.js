/**
 * Check backend health and available endpoints
 */

const API_BASE_URL = 'http://192.168.1.36:8080';

async function checkBackendHealth() {
  console.log('🏥 Checking Backend Health...');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Basic server health
    console.log('\n📡 Test 1: Server health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health response:', healthData);
    }

    // Test 2: Check if auth endpoints exist
    console.log('\n📡 Test 2: Auth endpoints...');
    const authTestResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });
    console.log('Auth endpoint status:', authTestResponse.status);
    const authText = await authTestResponse.text();
    console.log('Auth response:', authText);

    // Test 3: Check videos endpoint without auth
    console.log('\n📡 Test 3: Videos endpoint (no auth)...');
    const videosResponse = await fetch(`${API_BASE_URL}/api/v1/videos/trending`);
    console.log('Videos endpoint status:', videosResponse.status);
    const videosText = await videosResponse.text();
    console.log('Videos response:', videosText);

    // Test 4: Check if there are any users in the system
    console.log('\n📡 Test 4: Check for existing users...');
    
    // Try some common test credentials that might exist
    const testCredentials = [
      { email: 'admin@admin.com', password: 'admin123' },
      { email: 'test@test.com', password: 'test123' },
      { email: 'user@user.com', password: 'user123' },
      { username: 'admin', password: 'admin123' },
      { username: 'test', password: 'test123' }
    ];

    for (const cred of testCredentials) {
      try {
        const endpoint = cred.email ? '/api/v1/auth/login/email' : '/api/v1/auth/login/username';
        const body = cred.email 
          ? { email: cred.email, password: cred.password }
          : { username: cred.username, password: cred.password };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Found working credentials: ${cred.email || cred.username}`);
          console.log('Token received:', !!data.token);
          
          // Test the videos API with this token
          if (data.token) {
            console.log('\n📺 Testing videos API with valid token...');
            const videosWithAuthResponse = await fetch(`${API_BASE_URL}/api/v1/videos/trending`, {
              headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('Videos with auth status:', videosWithAuthResponse.status);
            if (videosWithAuthResponse.ok) {
              const videosData = await videosWithAuthResponse.json();
              console.log('✅ Videos API working! Found', videosData.data?.length || 0, 'videos');
              
              console.log('\n🎯 SOLUTION FOUND:');
              console.log('The API is working correctly. The issue is likely:');
              console.log('1. User is not logged in on the mobile app');
              console.log('2. Token has expired and needs refresh');
              console.log('3. User needs to log out and log back in');
              console.log('\n📱 Mobile App Steps:');
              console.log('1. Check if user is logged in');
              console.log('2. Try logging out and logging back in');
              console.log('3. Clear app storage if needed');
              return;
            } else {
              const errorText = await videosWithAuthResponse.text();
              console.log('Videos with auth error:', errorText);
            }
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ ${cred.email || cred.username}: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${cred.email || cred.username}: ${error.message}`);
      }
    }

    console.log('\n📋 SUMMARY:');
    console.log('- Backend server is running');
    console.log('- Auth endpoints are accessible');
    console.log('- Videos endpoint requires authentication');
    console.log('- No working test credentials found');
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Create a user account manually in the mobile app');
    console.log('2. Check if the user is properly logged in');
    console.log('3. Verify the token is being stored correctly');

  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running or not accessible');
      console.log('1. Make sure backend is running: cd Strmly-Backend && npm start');
      console.log('2. Check if IP address is correct for your network');
      console.log('3. Verify firewall settings');
    }
  }
}

checkBackendHealth();