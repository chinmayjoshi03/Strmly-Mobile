// Test script to verify drafts API endpoint
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.AUTH_TOKEN; // You'll need to set this

async function testDraftsEndpoint() {
  if (!AUTH_TOKEN) {
    console.error('❌ AUTH_TOKEN environment variable is not set');
    return;
  }

  console.log(`Testing drafts endpoint at: ${API_BASE_URL}/api/v1/drafts/all`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/drafts/all`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${response.status}`);
    console.log('Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    const responseText = await response.text();
    
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Valid JSON response');
      console.log('Response keys:', Object.keys(data));
      console.log('Data sample:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    } catch (e) {
      console.log('❌ Invalid JSON response');
      console.log('Response starts with:', responseText.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDraftsEndpoint();
