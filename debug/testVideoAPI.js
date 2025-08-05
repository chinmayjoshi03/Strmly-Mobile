// Test script to verify video API connectivity
const Constants = require('expo-constants');

const testVideoAPI = async () => {
  try {
    const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL || 'http://10.47.37.82:8080';
    const url = `${BACKEND_API_URL}/api/v1/videos/trending?page=1&limit=5`;
    
    console.log('Testing video API...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response successful');
    console.log('Message:', data.message);
    console.log('Videos count:', data.data?.length || 0);
    console.log('First video:', data.data?.[0]?.name || 'No videos');
    
    return data;
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    throw error;
  }
};

// Export for use in other files
module.exports = { testVideoAPI };

// Run test if called directly
if (require.main === module) {
  testVideoAPI();
}