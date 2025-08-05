/**
 * Debug script to test Series API endpoints
 * Run this with: node debug/testSeriesAPI.js
 */

const CONFIG = {
  API_BASE_URL: 'http://localhost:3000' // Update with your backend URL
};

// Test JWT token - replace with a valid token from your app
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg0Yzc0YWU3M2Q4ZDRlZjY3YjAyZTQiLCJpYXQiOjE3NTM1MzIyMzYsImV4cCI6MTc1NjEyNDIzNn0._pqT9psCN1nR5DJpB60HyA1L1pp327o1fxfZPO4BY3M';

async function testGetUserSeries() {
  console.log('🧪 Testing GET /api/v1/series/user');
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/series/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ GET user series successful');
      return data;
    } else {
      console.log('❌ GET user series failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('🚨 Network error:', error.message);
    return null;
  }
}

async function testCreateSeries() {
  console.log('🧪 Testing POST /api/v1/series/create');
  
  const seriesData = {
    title: 'Test Series ' + Date.now(),
    description: 'A test series created by debug script',
    genre: 'Action',
    language: 'english',
    type: 'Free',
    promisedEpisodesCount: 2,
  };

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/series/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seriesData),
    });

    console.log('📊 Response Status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Create series successful');
      return data;
    } else {
      console.log('❌ Create series failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('🚨 Network error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Series API Tests\n');
  
  // Test 1: Get user series (should work even if empty)
  await testGetUserSeries();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Create a new series
  await testCreateSeries();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Get user series again (should show the created series)
  await testGetUserSeries();
  
  console.log('\n🏁 Tests completed');
}

// Run the tests
runTests().catch(console.error);