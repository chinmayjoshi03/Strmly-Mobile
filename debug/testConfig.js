// Test script to verify backend connectivity
// Run with: node debug/testConfig.js

const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:8080/api/v1';

console.log('🔧 Testing Backend Connection');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('');

async function testConnection() {
  try {
    console.log('📡 Testing connection to backend...');
    
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is reachable!');
      console.log('Response:', data);
    } else {
      console.log('❌ Backend responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Failed to connect to backend');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting steps:');
    console.log('1. Make sure the backend server is running on port 8080');
    console.log('2. Check if your IP address in .env is correct');
    console.log('3. Ensure your device and computer are on the same network');
    console.log('4. Try using localhost if testing on web/simulator');
  }
}

testConnection();