/**
 * Debug script to test video API connectivity
 * Run with: node debug/testVideoAPI.js
 */

const API_BASE_URL = 'http://192.168.1.36:8080/api/v1';

async function testVideoAPI() {
  console.log('🔧 Testing Video API connectivity...');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Check if server is reachable
    console.log('\n📡 Test 1: Server connectivity...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log('Health check status:', healthResponse.status);
    
    // Test 2: Test trending videos endpoint without auth
    console.log('\n📡 Test 2: Trending videos endpoint (no auth)...');
    const noAuthResponse = await fetch(`${API_BASE_URL}/videos/trending`);
    console.log('No auth response status:', noAuthResponse.status);
    console.log('No auth response text:', await noAuthResponse.text());
    
    // Test 3: Test with dummy token
    console.log('\n📡 Test 3: Trending videos endpoint (with dummy token)...');
    const dummyTokenResponse = await fetch(`${API_BASE_URL}/videos/trending`, {
      headers: {
        'Authorization': 'Bearer dummy-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('Dummy token response status:', dummyTokenResponse.status);
    console.log('Dummy token response text:', await dummyTokenResponse.text());
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure the backend server is running on port 8080');
      console.log('2. Check if the IP address 192.168.1.36 is correct');
      console.log('3. Verify your network connection');
      console.log('4. Try running: cd Strmly-Backend && npm start');
    }
  }
}

// Run the test
testVideoAPI();