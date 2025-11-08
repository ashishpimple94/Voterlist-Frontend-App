// Test script for WhatsApp API
const axios = require('axios');

// Configuration
const PHONE_NUMBER_ID = '741032182432100';
const API_KEY = '798422d2-818f-11f0-98fc-02c8a5e042bd';
const TEST_PHONE_NUMBER = '919090385555'; // Replace with your test number
const PROXY_URL = 'http://localhost:3001/api/whatsapp-send';
const DIRECT_API_URL = `https://waba.xtendonline.com/v3/${PHONE_NUMBER_ID}/messages`;

// Test message
const testMessage = `🧪 *WhatsApp API Test*\n\n` +
  `✅ This is a test message from Voter Search App\n` +
  `📅 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
  `🔧 Testing API integration\n\n` +
  `If you receive this, the API is working correctly! 🎉`;

console.log('🧪 WhatsApp API Test Script');
console.log('=' .repeat(50));
console.log('\n📋 Configuration:');
console.log(`  Phone Number ID: ${PHONE_NUMBER_ID}`);
console.log(`  API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`  Test Phone: ${TEST_PHONE_NUMBER}`);
console.log(`  Message: ${testMessage.substring(0, 50)}...`);
console.log('\n' + '='.repeat(50));

// Test 1: Test via Proxy Server (Development)
async function testViaProxy() {
  console.log('\n🔍 Test 1: Testing via Proxy Server (localhost:3001)');
  console.log('-'.repeat(50));
  
  try {
    const payload = {
      phone_number: TEST_PHONE_NUMBER,
      message: testMessage,
      phone_number_id: PHONE_NUMBER_ID,
      api_key: API_KEY
    };
    
    console.log('📤 Sending request to:', PROXY_URL);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(PROXY_URL, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 SUCCESS! Message sent via proxy server!');
      console.log('   Message ID:', response.data.message_id || 'N/A');
      if (response.data.data?.contacts?.[0]?.wa_id) {
        console.log('   WA ID:', response.data.data.contacts[0].wa_id);
        console.log('   ✅ Contact is registered on WhatsApp');
      }
      return true;
    } else {
      console.log('\n❌ FAILED: API returned success: false');
      console.log('   Error:', response.data.error || response.data.message);
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ ERROR: Proxy server test failed');
    console.log('   Error Code:', error.code);
    console.log('   Error Message:', error.message);
    
    if (error.response) {
      console.log('   Response Status:', error.response.status);
      console.log('   Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Proxy server is not running!');
      console.log('   Please run: npm run server');
    }
    
    return false;
  }
}

// Test 2: Test Direct API (Optional - requires API key)
async function testDirectAPI() {
  console.log('\n🔍 Test 2: Testing Direct API (Optional)');
  console.log('-'.repeat(50));
  
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: TEST_PHONE_NUMBER,
      type: 'text',
      text: {
        body: testMessage
      }
    };
    
    console.log('📤 Sending request to:', DIRECT_API_URL);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(DIRECT_API_URL, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      }
    });
    
    console.log('\n✅ Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.messages && response.data.messages[0]?.id) {
      console.log('\n🎉 SUCCESS! Message sent directly via API!');
      console.log('   Message ID:', response.data.messages[0].id);
      if (response.data.contacts?.[0]?.wa_id) {
        console.log('   WA ID:', response.data.contacts[0].wa_id);
        console.log('   ✅ Contact is registered on WhatsApp');
      }
      return true;
    } else if (response.data.error) {
      console.log('\n❌ FAILED: API returned error');
      console.log('   Error:', response.data.error);
      return false;
    } else {
      console.log('\n⚠️  Unexpected response format');
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ ERROR: Direct API test failed');
    console.log('   Error Code:', error.code);
    console.log('   Error Message:', error.message);
    
    if (error.response) {
      console.log('   Response Status:', error.response.status);
      console.log('   Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('\n🚀 Starting WhatsApp API Tests...\n');
  
  // Test via proxy (recommended)
  const proxyResult = await testViaProxy();
  
  // Wait a bit before next test
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test direct API (optional)
  // Uncomment to test direct API
  // const directResult = await testDirectAPI();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`  Proxy Server Test: ${proxyResult ? '✅ PASSED' : '❌ FAILED'}`);
  // console.log(`  Direct API Test: ${directResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('\n' + '='.repeat(50));
  
  if (proxyResult) {
    console.log('\n✅ WhatsApp API is working correctly!');
    console.log('   Check the recipient\'s WhatsApp for the test message.');
    console.log('\n⚠️  Important Notes:');
    console.log('   • Message delivery may take a few seconds');
    console.log('   • Free-form messages only work within 24-hour window');
    console.log('   • For first-time messages, you need approved templates');
  } else {
    console.log('\n❌ WhatsApp API test failed!');
    console.log('   Please check:');
    console.log('   1. Proxy server is running (npm run server)');
    console.log('   2. API credentials are correct');
    console.log('   3. Phone number is valid and registered on WhatsApp');
    console.log('   4. Network connection is working');
  }
  
  process.exit(proxyResult ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal Error:', error);
  process.exit(1);
});

