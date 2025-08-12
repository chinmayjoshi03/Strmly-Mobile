/**
 * Test VideoFeed API with existing user credentials
 * This script helps identify if the issue is authentication or API-related
 */

const API_BASE_URL = 'http://192.168.1.36:8080/api/v1';

async function testWithExistingUser() {
  console.log('🔍 Testing VideoFeed with existing user...');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  // Common test credentials that might exist
  const testCredentials = [
    { email: 'test@example.com', password: 'password123' },
    { email: 'admin@strmly.com', password: 'admin123' },
    { email: 'user@test.com', password: 'test123' },
    { username: 'testuser', password: 'password123' },
    { username: 'admin', password: 'admin123' }
  ];

  for (const cred of testCredentials) {
    try {
      console.log(`\n🔐 Trying ${cred.email || cred.username}...`);
      
      const loginEndpoint = cred.email ? '/auth/login/email' : '/auth/login/username';
      const loginBody = cred.email 
        ? { email: cred.email, password: cred.password }
        : { username: cred.username, password: cred.password };

      const loginResponse = await fetch(`${API_BASE_URL}${loginEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginBody)
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        
        // Test trending videos with this token
        const videosResponse = await fetch(`${API_BASE_URL}/videos/trending?page=1&limit=10`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          console.log('✅ Trending videos API works!');
          console.log(`📊 Found ${videosData.data?.length || 0} videos`);
          
          if (videosData.data && videosData.data.length > 0) {
            console.log('📹 Sample video:', {
              id: videosData.data[0]._id,
              name: videosData.data[0].name,
              creator: videosData.data[0].created_by?.username
            });
          }
          
          console.log('\n🎉 SUCCESS: The API is working correctly!');
          console.log('💡 The issue might be:');
          console.log('   1. User not logged in on mobile app');
          console.log('   2. Invalid/expired token in mobile app');
          console.log('   3. Network connectivity issue on mobile device');
          return;
        } else {
          const errorText = await videosResponse.text();
          console.log('❌ Videos API failed:', videosResponse.status, errorText);
        }
      } else {
        const errorText = await loginResponse.text();
        console.log(`❌ Login failed: ${loginResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${cred.email || cred.username}:`, error.message);
    }
  }

  console.log('\n📋 CONCLUSION');
  console.log('=============');
  console.log('❌ Could not authenticate with common test credentials');
  console.log('💡 Next steps:');
  console.log('   1. Check if you have any existing user accounts');
  console.log('   2. Create a user account manually in the mobile app');
  console.log('   3. Check mobile app authentication state');
  console.log('   4. Verify token is being sent correctly from mobile app');
  
  console.log('\n🔧 Mobile App Debugging:');
  console.log('   1. Add console.log in VideoFeed.tsx to check token value');
  console.log('   2. Check if useAuthStore.token is null/undefined');
  console.log('   3. Try logging out and logging back in');
  console.log('   4. Clear app storage and re-authenticate');
}

testWithExistingUser();