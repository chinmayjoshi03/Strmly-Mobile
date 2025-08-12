/**
 * Comprehensive diagnosis script for VideoFeed "failed to fetch videos" issue
 * Run with: node debug/diagnoseVideoFeedIssue.js
 */

const API_BASE_URL = 'http://192.168.1.36:8080/api/v1';

async function diagnoseVideoFeedIssue() {
  console.log('🔍 Diagnosing VideoFeed "failed to fetch videos" issue...');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  const issues = [];
  const solutions = [];

  try {
    // Test 1: Server connectivity
    console.log('\n📡 Test 1: Server connectivity...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    if (healthResponse.status === 200) {
      console.log('✅ Server is reachable');
    } else {
      console.log('❌ Server health check failed');
      issues.push('Server health check failed');
      solutions.push('Check if backend server is running: cd Strmly-Backend && npm start');
    }

    // Test 2: API endpoint exists
    console.log('\n📡 Test 2: API endpoint validation...');
    const endpointResponse = await fetch(`${API_BASE_URL}/videos/trending`);
    if (endpointResponse.status === 401) {
      console.log('✅ API endpoint exists (returns 401 - auth required)');
    } else if (endpointResponse.status === 404) {
      console.log('❌ API endpoint not found');
      issues.push('Trending videos endpoint not found');
      solutions.push('Check if video routes are properly configured in backend');
    } else {
      console.log(`⚠️  Unexpected response: ${endpointResponse.status}`);
    }

    // Test 3: Check if we can create a test user and get token
    console.log('\n📡 Test 3: Authentication test...');
    try {
      // Try to create a test user
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword123'
      };

      const signupResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      if (signupResponse.ok) {
        const signupData = await signupResponse.json();
        console.log('✅ Test user created successfully');

        // Try to login with test user
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('✅ Test user login successful');

          // Test trending videos with valid token
          const videosResponse = await fetch(`${API_BASE_URL}/videos/trending`, {
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json'
            }
          });

          if (videosResponse.ok) {
            const videosData = await videosResponse.json();
            console.log('✅ Trending videos API works with valid token');
            console.log(`📊 Found ${videosData.data?.length || 0} videos`);
            
            if (!videosData.data || videosData.data.length === 0) {
              issues.push('No videos found in database');
              solutions.push('Add some test videos to the database');
            }
          } else {
            console.log('❌ Trending videos API failed with valid token');
            const errorText = await videosResponse.text();
            console.log('Error:', errorText);
            issues.push('API fails even with valid authentication');
            solutions.push('Check backend video controller and database connection');
          }
        } else {
          console.log('❌ Test user login failed');
          issues.push('Authentication system not working');
          solutions.push('Check backend auth routes and JWT configuration');
        }
      } else {
        console.log('❌ Test user creation failed');
        const errorText = await signupResponse.text();
        console.log('Signup error:', errorText);
        issues.push('User registration not working');
        solutions.push('Check backend auth routes and database connection');
      }
    } catch (authError) {
      console.log('❌ Authentication test failed:', authError.message);
      issues.push('Authentication system error');
      solutions.push('Check backend auth implementation');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      issues.push('Cannot connect to backend server');
      solutions.push('Start the backend server: cd Strmly-Backend && npm start');
      solutions.push('Check if IP address 192.168.1.36 is correct for your network');
      solutions.push('Update EXPO_PUBLIC_BACKEND_API_URL in .env if needed');
    }
  }

  // Summary
  console.log('\n📋 DIAGNOSIS SUMMARY');
  console.log('===================');
  
  if (issues.length === 0) {
    console.log('✅ No issues found! The API should be working.');
    console.log('💡 If you\'re still seeing "failed to fetch videos", check:');
    console.log('   - User authentication state in the mobile app');
    console.log('   - Network connectivity on the mobile device');
    console.log('   - Console logs in the mobile app for more details');
  } else {
    console.log('❌ Issues found:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    
    console.log('\n💡 Suggested solutions:');
    solutions.forEach((solution, index) => {
      console.log(`   ${index + 1}. ${solution}`);
    });
  }

  console.log('\n🔧 Quick fixes to try:');
  console.log('1. Restart the backend server');
  console.log('2. Check if user is logged in on mobile app');
  console.log('3. Clear app data and login again');
  console.log('4. Check network connectivity between mobile and backend');
}

// Run the diagnosis
diagnoseVideoFeedIssue();