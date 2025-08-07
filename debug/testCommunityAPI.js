/**
 * Test script for Community API
 * Run this to test the /api/v1/community/all endpoint
 * 
 * Usage: node debug/testCommunityAPI.js
 */

const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:8080/api/v1'
};

async function testCommunityAPI() {
  try {
    console.log('🔄 Testing Community API...');
    console.log('📡 API URL:', `${CONFIG.API_BASE_URL}/community/all`);
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/community/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real app, you'd need a valid auth token
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.communities) {
      console.log('📋 Communities found:', data.communities.length);
      data.communities.forEach((community, index) => {
        console.log(`  ${index + 1}. ${community.name} (ID: ${community._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCommunityAPI();