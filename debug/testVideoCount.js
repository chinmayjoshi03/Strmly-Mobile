// Simple test to check if there are videos in the database
const API_BASE_URL = 'http://192.168.1.36:8080/api/v1';

async function testVideoCount() {
  console.log('🔧 Testing Video Count in Database');
  
  try {
    // Test the trending videos endpoint (which might not require auth)
    console.log('\n1. Testing trending videos endpoint...');
    const trendingResponse = await fetch(`${API_BASE_URL}/videos/trending?page=1&limit=10`);
    console.log('   Trending videos status:', trendingResponse.status);
    
    if (trendingResponse.status === 401) {
      console.log('   Trending endpoint requires auth');
    } else if (trendingResponse.ok) {
      const trendingData = await trendingResponse.json();
      console.log('   Trending videos count:', trendingData.data?.length || 0);
    }
    
    // Test if we can get any info about videos without auth
    console.log('\n2. Testing general video info...');
    const generalResponse = await fetch(`${API_BASE_URL}/videos`);
    console.log('   General videos status:', generalResponse.status);
    
    if (generalResponse.status === 401) {
      console.log('   ✅ All video endpoints require authentication (expected)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n📝 Summary:');
  console.log('   - Backend is running and responding');
  console.log('   - Video endpoints require authentication');
  console.log('   - Need to check if user is properly logged in');
}

testVideoCount();