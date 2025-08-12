// Script to create a test user for debugging
const API_BASE_URL = 'http://192.168.1.36:8080/api/v1';

async function createTestUser() {
  console.log('🔧 Creating Test User');
  
  const testUser = {
    username: 'testuser123',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };
  
  try {
    console.log('\n1. Creating user account...');
    const signupResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    console.log('   Signup status:', signupResponse.status);
    
    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('   ✅ User created successfully');
      console.log('   User ID:', signupData.user?.id);
    } else {
      const errorText = await signupResponse.text();
      console.log('   ❌ Signup failed:', errorText);
      
      if (signupResponse.status === 400 && errorText.includes('already exists')) {
        console.log('   User already exists, trying to login...');
        
        // Try to login with existing user
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login/username`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: testUser.username,
            password: testUser.password,
          }),
        });
        
        console.log('   Login status:', loginResponse.status);
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('   ✅ Login successful');
          console.log('   Token:', loginData.token?.substring(0, 20) + '...');
          console.log('   User:', loginData.user?.username);
          
          // Test the recommendations endpoint with this token
          console.log('\n2. Testing recommendations with token...');
          const recResponse = await fetch(`${API_BASE_URL}/recommendations/videos`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('   Recommendations status:', recResponse.status);
          
          if (recResponse.ok) {
            const recData = await recResponse.json();
            console.log('   ✅ Recommendations fetched successfully');
            console.log('   Videos count:', recData.recommendations?.length || 0);
          } else {
            const errorText = await recResponse.text();
            console.log('   ❌ Recommendations failed:', errorText);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n📝 Test User Credentials:');
  console.log('   Username:', testUser.username);
  console.log('   Email:', testUser.email);
  console.log('   Password:', testUser.password);
}

createTestUser();