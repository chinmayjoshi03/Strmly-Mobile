/**
 * Test script for user communities API endpoint
 * Tests the updated community selection functionality
 */

const CONFIG = {
  API_BASE_URL: 'http://localhost:8080/api/v1' // Update this to match your backend URL
};

// Test token - replace with a valid token from your app
const TEST_TOKEN = 'your_test_token_here';

async function testUserCommunities() {
  console.log('🧪 Testing User Communities API...\n');

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/community/user-communities?type=all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Success! User Communities Data:');
    console.log('📈 Total Communities:', data.totalCount);
    console.log('🏗️ Created Communities:', data.createdCount);
    console.log('👥 Joined Communities:', data.joinedCount);
    
    console.log('\n📋 Communities List:');
    data.communities.forEach((community, index) => {
      console.log(`  ${index + 1}. ${community.name} (ID: ${community._id})`);
      console.log(`     Type: ${community.community_fee_type}`);
      console.log(`     Founder: ${community.founder?.username || 'Unknown'}`);
      console.log(`     Followers: ${community.followers?.length || 0}`);
      console.log('');
    });

    // Test dropdown format conversion
    console.log('🔄 Dropdown Format:');
    const dropdownOptions = [
      { label: 'No Community', value: 'none' },
      ...data.communities.map(community => ({
        label: community.name,
        value: community._id,
      }))
    ];
    
    dropdownOptions.forEach((option, index) => {
      console.log(`  ${index + 1}. "${option.label}" -> ${option.value}`);
    });

  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

// Test different types
async function testCommunityTypes() {
  console.log('\n🧪 Testing Different Community Types...\n');

  const types = ['all', 'created', 'joined'];

  for (const type of types) {
    console.log(`\n📊 Testing type: ${type}`);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/community/user-communities?type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`  ✅ ${type}: ${data.communities.length} communities`);
      } else {
        console.log(`  ❌ ${type}: ${response.status} error`);
      }
    } catch (error) {
      console.log(`  ❌ ${type}: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  if (TEST_TOKEN === 'your_test_token_here') {
    console.log('⚠️  Please update TEST_TOKEN with a valid authentication token');
    console.log('⚠️  You can get this from your app\'s auth store or network inspector');
    return;
  }

  await testUserCommunities();
  await testCommunityTypes();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testUserCommunities, testCommunityTypes };