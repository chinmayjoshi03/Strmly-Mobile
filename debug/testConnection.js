// Test script to verify backend connection
const testConnection = async () => {
  const API_URL = 'http://192.168.1.36:8080/api/v1';
  
  console.log('🔧 Testing connection to:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Response data:', data);
    } else {
      console.log('❌ Response not ok');
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('❌ Error details:', error);
  }
};

testConnection();