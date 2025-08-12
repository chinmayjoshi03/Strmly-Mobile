// Simple test without importing config
const API_BASE_URL = 'http://192.168.1.36:8080/api/v1';

async function testRecommendationsAPI() {
  console.log('🔧 Testing Recommendations API');
  console.log('📍 API URL:', API_BASE_URL);
  
  // First, let's test if the server is running
  try {
    console.log('\n1. Testing server health...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log('   Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('   Health response:', healthData);
    }
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    console.log('   Make sure the backend server is running on port 8080');
    return;
  }
  
  // Test without authentication first
  try {
    console.log('\n2. Testing recommendations endpoint without auth...');
    const response = await fetch(`${API_BASE_URL}/recommendations/videos`);
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('   Response:', responseText);
    
    if (response.status === 401) {
      console.log('✅ Expected 401 - endpoint requires authentication');
    }
  } catch (error) {
    console.error('❌ Recommendations test failed:', error.message);
  }
  
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure backend server is running: cd Strmly-Backend && npm start');
  console.log('   2. Check if user is logged in with valid token');
  console.log('   3. Verify network connectivity between mobile app and backend');
}

testRecommendationsAPI();