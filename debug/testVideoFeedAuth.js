/**
 * Test VideoFeed authentication and API calls
 * This script simulates the exact same calls that VideoFeed makes
 */

const API_BASE_URL = 'http://192.168.1.36:8080/api/v1';

async function testVideoFeedAuth() {
  console.log('🔍 Testing VideoFeed Authentication Flow...');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  try {
    // Step 1: Test if we can create a user and get a token
    console.log('\n🔐 Step 1: Creating test user...');
    
    const testUser = {
      username: `testuser${Date.now().toString().slice(-6)}`,
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.log('❌ Registration failed:', registerResponse.status, errorText);
      
      // Try to login with existing credentials instead
      console.log('\n🔐 Trying to login with common credentials...');
      
      const commonCreds = [
        { email: 'test@test.com', password: 'password' },
        { email: 'user@example.com', password: 'password123' },
        { username: 'testuser', password: 'password123' }
      ];

      for (const cred of commonCreds) {
        try {
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
            console.log('✅ Login successful with:', cred.email || cred.username);
            
            // Test the trending videos API
            await testTrendingVideosAPI(loginData.token);
            return;
          }
        } catch (error) {
          console.log('❌ Login attempt failed:', error.message);
        }
      }
      
      console.log('❌ Could not authenticate with any credentials');
      return;
    }

    const registerData = await registerResponse.json();
    console.log('✅ User registered successfully');

    // Step 2: Login with the new user
    console.log('\n🔐 Step 2: Logging in...');
    
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('🔑 Token received:', loginData.token ? 'Yes' : 'No');
    console.log('👤 User data:', loginData.user ? 'Yes' : 'No');

    // Step 3: Test the trending videos API
    await testTrendingVideosAPI(loginData.token);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testTrendingVideosAPI(token) {
  console.log('\n📺 Step 3: Testing Trending Videos API...');
  console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'null');

  try {
    const url = `${API_BASE_URL}/videos/trending?page=1&limit=10`;
    console.log('📡 Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API call failed:');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Response:', errorText);
      
      if (response.status === 401) {
        console.log('💡 This suggests the token is invalid or expired');
      } else if (response.status === 403) {
        console.log('💡 This suggests the token is valid but lacks permissions');
      } else if (response.status === 500) {
        console.log('💡 This suggests a server-side error');
      }
      return;
    }

    const data = await response.json();
    console.log('✅ API call successful!');
    console.log('📊 Response structure:', {
      hasData: !!data.data,
      dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
      videoCount: data.data?.length || 0,
      message: data.message
    });

    if (data.data && data.data.length > 0) {
      console.log('🎬 Sample video:', {
        id: data.data[0]._id,
        name: data.data[0].name,
        hasVideoUrl: !!data.data[0].videoUrl,
        hasCreatedBy: !!data.data[0].created_by
      });
    } else {
      console.log('⚠️ No videos found in response');
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testVideoFeedAuth();